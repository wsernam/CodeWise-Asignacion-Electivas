from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable, List, Optional
from django.db import IntegrityError
from asignacion.models import Asignacion
from gestion_hojas_de_calculo.models import PerfilAcademico
from referencias.models import SeleccionEstudianteElectiva as Sel
from referencias.models import Oferta as Oferta
# Dominio de cupos / reglas (tu módulo variables.py)
from asignacion.variables import (
    ElectivaCupoPool,
    ELECTIVAS_DEBE_VER,
    REGLAS_MAX_POR_SEM,
    ADVANCE_MIN_NO_NIV,
    # opcional: NIVELADO_FIJO
)

# =========================
# Utils y “perfil ligero”
# =========================

def _int(v, default=0) -> int:
    try:
        return int(v)
    except Exception:
        return default

def _float(v, default=0.0) -> float:
    try:
        return float(v)
    except Exception:
        return default

@dataclass
class PerfilLigero:
    nivelado: bool
    avance: float
    periodos: int
    cursadas: int
    pro_codigo: Optional[str]

def _leer_perfil(anio: int, sem: int, est_id: int, pro_codigo: Optional[str]) -> PerfilLigero:
    """
    Lee SOLO lo necesario del PerfilAcademico del período (anio, sem) para calcular n.
    (Usa .values(...) por performance, pero sigue leyendo de tu modelo real).
    """
    pa = (
        PerfilAcademico.objects
        .filter(est_codigo_id=est_id, perfil_anio=anio, perfil_semestre=sem)
        .values("nivelado", "porcentaje_avance", "num_periodos_matriculados", "num_electivas_cursadas")
        .first()
    ) or {}

    return PerfilLigero(
        nivelado=bool(pa.get("nivelado", False)),
        avance=_float(pa.get("porcentaje_avance", 0.0)),
        periodos=_int(pa.get("num_periodos_matriculados", 0)),
        cursadas=_int(pa.get("num_electivas_cursadas", 0)),
        pro_codigo=pro_codigo,
    )

# =========================
# Reglas: necesidad final
# =========================

def _necesidad_final(perfil: PerfilLigero) -> int:
    """
    n_base = max(0, debe_ver_total(programa) - cursadas)

    - Nivelado: aplica tope por semestre según REGLAS_MAX_POR_SEM[prog][periodos]
      (si no hay clave exacta, toma el máximo definido para ese programa).
    - No nivelado: sin tope aquí; la prioridad se resuelve por ranking.
    """
    #Veto SOLO para NO nivelados con avance < 65%
    if (not perfil.nivelado) and (perfil.avance < ADVANCE_MIN_NO_NIV):  # o < 65.0 si no quieres variable
        return 0
    prog = perfil.pro_codigo or "DEFAULT"
    debe_ver_total = ELECTIVAS_DEBE_VER.get(prog, ELECTIVAS_DEBE_VER["DEFAULT"])
    n_base = max(0, debe_ver_total - perfil.cursadas)

    if perfil.nivelado:
        # 👇 Mapear periodos (cursados) → semestre lógico actual
        semestre_logico = max(1, int(perfil.periodos) + 1)  # 7→8, 8→9, 9→10, etc.
        reglas_prog = REGLAS_MAX_POR_SEM.get(prog, {})

        if semestre_logico in reglas_prog:
            return min(n_base, reglas_prog[semestre_logico])

        # Fallback: si no hay regla para ese semestre, usa el máximo del programa
        return min(n_base, max(reglas_prog.values()) if reglas_prog else 0)

    return n_base

# =========================
# Preferencias y oferta
# =========================

def _preferencias_estudiante(est_id: int, anio: int, sem: int) -> List[int]:
    return list(
        Sel.objects
        .filter(est_codigo_id=est_id, sel_anio=anio, sel_num_semestre=sem)
        .order_by("sel_prioridad")
        .values_list("ele_codigo_id", flat=True)
    )

def _oferta_ids_global(anio: int, sem: int) -> List[int]:
    return list(
        Oferta.objects
        .filter(ofe_anio=anio, ofe_num_semestre=sem)
        .values_list("ele_codigo_id", flat=True)
        .distinct()
    )

# =========================
# Servicio principal
# =========================

class AsignadorService:
    def __init__(self, anio: int, semestre: int, debug: bool = False):
        self.anio = anio
        self.semestre = semestre
        self.debug = debug
        self._debug_rows: list[tuple[int,int,str]] = []

        # Pool de cupos a partir de la oferta del período (global)
        oferta_ids = _oferta_ids_global(anio, semestre)
        self.pool = ElectivaCupoPool.from_oferta_ids(oferta_ids)

    # ---- helpers de creación ----

    def _asignar_firme(self, est_id: int, ele_id: int) -> bool:
        cupo = self.pool.get(ele_id)
        if not cupo.tiene_cupo_firme():
            return False
        try:
            Asignacion.objects.create(
                anio=self.anio,
                asi_num_semestre=self.semestre,
                est_codigo_id=est_id,
                ele_codigo_id=ele_id,
                en_lista_espera=False,
            )
            cupo.asignar_firme()
            return True
        except IntegrityError:
            return False

    def _asignar_espera(self, est_id: int, ele_id: int) -> bool:
        cupo = self.pool.get(ele_id)
        if not cupo.tiene_cupo_espera():
            return False
        try:
            Asignacion.objects.create(
                anio=self.anio,
                asi_num_semestre=self.semestre,
                est_codigo_id=est_id,
                ele_codigo_id=ele_id,
                en_lista_espera=True,
            )
            cupo.asignar_espera()
            return True
        except IntegrityError:
            return False

    # ---- motor ----

    def ejecutar(self, ranking: Iterable[object]) -> dict:
        """
        Para cada DTO del ranking (requiere .est_codigo y .pro_codigo):
          1) Calcula n (necesidad) con PerfilAcademico del período.
          2) Recorre preferencias por prioridad intentando cupos firmes.
          3) Si faltan, recorre otra vez para colocar en lista de espera.
          4) Se detiene cuando firmes + espera == n.
        """
        firmes_total = 0
        espera_total = 0
        omitidas = 0

        for dto in ranking:
            est_id = getattr(dto, "est_codigo", None)
            pro = getattr(dto, "pro_codigo", None)
            if not est_id:
                omitidas += 1
                continue

            perfil = _leer_perfil(self.anio, self.semestre, est_id, pro)
            n = _necesidad_final(perfil)
            if n <= 0:
                continue

            pref_ids = _preferencias_estudiante(est_id, self.anio, self.semestre)
            if not pref_ids:
                continue

            firmes = 0
            espera = 0

            # Pase 1: firmes
            for ele_id in pref_ids:
                if firmes >= n:
                    break
                try:
                    ok = self._asignar_firme(est_id, ele_id)
                except KeyError:
                    ok = False
                if ok:
                    firmes += 1
                    if self.debug:
                        self._debug_rows.append((est_id, ele_id, "FIRME"))

            # Pase 2: espera
            while (firmes + espera) < n:
                progreso = False
                for ele_id in pref_ids:
                    if (firmes + espera) >= n:
                        break
                    try:
                        ok = self._asignar_espera(est_id, ele_id)
                    except KeyError:
                        ok = False
                    if ok:
                        espera += 1
                        progreso = True
                        if self.debug:
                            self._debug_rows.append((est_id, ele_id, "ESPERA"))
                if not progreso:
                    break

            firmes_total += firmes
            espera_total += espera

        return {
            "creadas_firmes": firmes_total,
            "creadas_espera": espera_total,
            "omitidas_sin_est": omitidas,
            "pool_resumen": self.pool.resumen(),
            # "traza": self._debug_rows if self.debug else None,
        }
