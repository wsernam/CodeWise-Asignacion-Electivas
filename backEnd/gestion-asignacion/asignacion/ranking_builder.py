# asignacion/ranking_builder.py
from dataclasses import dataclass
from referencias.models import Estudiante
from gestion_hojas_de_calculo.models import PerfilAcademico
from asignacion.services.priority_service import construir_lista_prioridad

@dataclass
class PerfilRankDTO:
    est: Estudiante
    semestre_actual: int
    es_nivelado: bool
    electivas_aprobadas: int
    porcentaje_avance: float
    promedio: float

def _semestre_actual_de(est: Estudiante, anio: int, semestre: int) -> int:
    # Toma el último perfil del periodo; si no hay, intenta el más reciente
    p = (PerfilAcademico.objects
         .filter(est_codigo=est, perfil_anio=anio, perfil_semestre=semestre)
         .order_by("-perfil_anio","-perfil_semestre").first())
    return int(getattr(p, "num_periodos_matriculados", 0) or 0)

def build_ranking_dtos(anio: int, semestre: int, pro_codigo: str | None = None) -> list[PerfilRankDTO]:
    rows = construir_lista_prioridad(anio=anio, num_semestre=semestre, pro_codigo=pro_codigo)
    dtos: list[PerfilRankDTO] = []
    for r in rows:
        # r.est_codigo es la PK del estudiante según tu StudentRow
        est = Estudiante.objects.get(pk=r.est_codigo)
        dtos.append(PerfilRankDTO(
            est=est,
            semestre_actual=_semestre_actual_de(est, anio, semestre),
            es_nivelado=bool(r.nivelado),
            electivas_aprobadas=int(r.num_electivas_cursadas or 0),
            porcentaje_avance=float(r.porcentaje_avance or 0.0),
            promedio=float(r.promedio or 0.0),
        ))
    return dtos
