from typing import List, Optional
from django.db.models import Q
from asignacion.priority.registry import get_strategy
from asignacion.priority.contracts import StudentRow

# Importa TUS modelos reales:
from gestion_hojas_de_calculo.models import PerfilAcademico, Estudiante

def _to_row(p: PerfilAcademico) -> StudentRow:
    e = p.est_codigo
    prog = e.pro_codigo  # FK Programa
    total = getattr(prog, "pro_total_electivas", 0) or 0
    pendientes = max(0, total - int(p.num_electivas_cursadas or 0))

    return StudentRow(
        est_codigo=e.pk,
        pro_codigo=prog.pro_codigo,
        estado_activo=bool(p.estado),
        nivelado=bool(p.nivelado),
        porcentaje_avance=float(p.porcentaje_avance or 0.0),
        promedio=float(p.promedio or 0.0),
        num_electivas_cursadas=int(p.num_electivas_cursadas or 0),
        electivas_pendientes=pendientes,   # <- aquí
    )

def construir_lista_prioridad(
    *,
    anio: int,
    num_semestre: int,
    pro_codigo: Optional[str] = None,
    estrategia: str = "protocol-2025",
) -> List[StudentRow]:
    qs = (PerfilAcademico.objects
          .select_related("est_codigo", "est_codigo__pro_codigo")
          .filter(perfil_anio=anio, perfil_semestre=num_semestre))
    if pro_codigo:
        qs = qs.filter(est_codigo__pro_codigo__pro_codigo=pro_codigo)

    rows = [_to_row(p) for p in qs]
    strategy = get_strategy(estrategia)
    return strategy.rank(rows)
