from __future__ import annotations
from dataclasses import dataclass, field
import os
from typing import Dict, Iterable, Optional 

# =========================
# Configuración (overridable por ENV)
# =========================

# Regla de negocio: tope de electivas asignables por semestre (para estudiantes nivelados),
# parametrizado por PROGRAMA -> {SEMESTRE: MAX_ELECTIVAS}
# Ej.: en PIS, en semestre 8 se pueden asignar 2 electivas, en 9: 2, en 10: 1.
# Ojo: en PIET aparece "9: 11" (¿intencional? suena a typo de 1). Revísalo.
NIVELADO_FIJO: int = int(os.getenv("NIVELADO_FIJO", "2"))
REGLAS_MAX_POR_SEM = {
    "DEFAULT": NIVELADO_FIJO,
    "PIS":  {8: 2, 9: 2, 10: 1}, 
    "PIET": {8: 1, 9: 11, 10: 1}, 
    "PIAI":  {8: 1, 9: 2, 10: 1},
}

# Total de electivas requeridas por programa (para calcular "debe ver").
# Se expone un valor por defecto vía ENV para programas no listados.
ELECTIVAS_DEBE_VER_POR_DEFECTO: int = int(os.getenv("NIVELADO_MAX_POR_DEFECTO", "5"))
ELECTIVAS_DEBE_VER: dict[str, int] = {
    "DEFAULT": ELECTIVAS_DEBE_VER_POR_DEFECTO,
    "PIS": 5,
    "PIAI": 4,
    "PIET": 3,
}


# Cupos por electiva en memoria (no persiste en DB).
# Separamos "firmes" (matrícula asegurada) y "lista de espera".
CUPOS_FIRMES_POR_ELECTIVA = int(os.getenv("CUPOS_FIRMES", "4"))
CUPOS_ESPERA_POR_ELECTIVA = int(os.getenv("CUPOS_ESPERA", "4"))


@dataclass
class ElectivaCupo:
    """
    Contador in-memory de cupos por electiva.

    - firmes_max / espera_max: capacidad tope por tipo.
    - firmes_asignadas / espera_asignadas: contadores actuales.

    Métodos principales:
    - tiene_cupo_firme() / tiene_cupo_espera(): consulta disponibilidad.
    - asignar_firme() / asignar_espera(): intenta reservar un cupo, retorna True/False.
    """
    ele_codigo_id: str
    firmes_max: int = CUPOS_FIRMES_POR_ELECTIVA
    espera_max: int = CUPOS_ESPERA_POR_ELECTIVA
    firmes_asignadas: int = 0
    espera_asignadas: int = 0

    # ---- consultas de capacidad ----
    def tiene_cupo_firme(self) -> bool:
        """Devuelve True si aún no se alcanzó el tope de cupos firmes."""
        return self.firmes_asignadas < self.firmes_max

    def tiene_cupo_espera(self) -> bool:
        """Devuelve True si aún no se alcanzó el tope de lista de espera."""
        return self.espera_asignadas < self.espera_max

    # ---- mutaciones ----
    def asignar_firme(self) -> bool:
        """
        Intenta asignar un cupo firme. Idempotencia lógica:
        - No lanza excepción si no hay cupo; retorna False y no modifica estado.
        """
        if not self.tiene_cupo_firme():
            return False
        self.firmes_asignadas += 1
        return True

    def asignar_espera(self) -> bool:
        """
        Intenta asignar un cupo en lista de espera. Mismo contrato que asignar_firme().
        """
        if not self.tiene_cupo_espera():
            return False
        self.espera_asignadas += 1
        return True


@dataclass
class ElectivaCupoPool:
    """
    Índice/Pool de cupos por electiva, accesible por id (str).
    Casos de uso típicos:
    - Inicializar el pool con la oferta actual (IDs de electivas).
    - Consultar y mutar cupos por electiva durante la asignación.
    
    Nota: Este pool es in-memory (proceso actual). Si necesitas consistencia
    multi-proceso/cluster, deberías persistir en DB o usar un lock distribuido.
    """
    items: Dict[str, ElectivaCupo] = field(default_factory=dict)

    @classmethod
    def from_oferta_ids(
        cls,
        electiva_ids: Iterable[str],
        firmes_default: int = CUPOS_FIRMES_POR_ELECTIVA,
        espera_default: int = CUPOS_ESPERA_POR_ELECTIVA,
    ) -> "ElectivaCupoPool":
        """
        Construye un pool a partir de un iterable de IDs de electiva.
        Permite inyectar defaults de capacidad (útil para tests o escenarios especiales).
        """
        pool = cls()
        for ele_id in electiva_ids:
            pool.items[str(ele_id)] = ElectivaCupo(
                ele_codigo_id=str(ele_id),
                firmes_max=firmes_default,
                espera_max=espera_default,
            )
        return pool

    def get(self, ele_codigo_id: str) -> ElectivaCupo:
        """
        Obtiene el objeto ElectivaCupo para un id dado.
        Asume que fue cargado previamente vía from_oferta_ids; si no, KeyError.
        (Podrías cambiar a get(..., default) si prefieres autoinicializar.)
        """
        return self.items[str(ele_codigo_id)]

    # Utilidad para depurar/monitorear
    def resumen(self) -> Dict[str, dict]:
        """
        Devuelve un dict amigable para logs/observabilidad con ocupación "usados/tope".
        Ej.: {"ELE-101": {"firmes": "3/19", "espera": "1/10"}, ...}
        """
        return {
            k: {
                "firmes": f"{v.firmes_asignadas}/{v.firmes_max}",
                "espera": f"{v.espera_asignadas}/{v.espera_max}",
            }
            for k, v in self.items.items()
        }
