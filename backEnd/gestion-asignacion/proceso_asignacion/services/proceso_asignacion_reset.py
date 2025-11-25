# gestion_asignacion/services/proceso_asignacion_reset.py

from django.db import transaction
from django.core.exceptions import ValidationError

from gestion_hojas_de_calculo.models import PerfilAcademico
from proceso_asignacion.models import ProcesoAsignacion
# TODO: cambia esto por tu modelo real de asignaciones
from asignacion.models import Asignacion


@transaction.atomic
def eliminar_todo_del_proceso(pa_codigo: int) -> None:
    """
    Elimina TODO lo generado para un proceso de asignación:
    - Perfiles académicos del año/semestre del proceso
    - Asignaciones del año/semestre del proceso
    - El propio ProcesoAsignacion

    Solo aplica para procesos ACTIVOS y NO FINALIZADOS.
    No toca la tabla Estudiante.
    """
    try:
        proceso = ProcesoAsignacion.objects.select_for_update().get(
            pa_codigo=pa_codigo
        )
    except ProcesoAsignacion.DoesNotExist:
        raise ValidationError("El proceso de asignación no existe.")

    # 1) Validar que esté ACTIVO
    if proceso.pa_estado != ProcesoAsignacion.Estado.ACTIVO:
        raise ValidationError("Solo se puede eliminar un proceso ACTIVO.")

    # 2) Validar que NO esté FINALIZADO
    if proceso.pa_paso_actual == ProcesoAsignacion.PasoActual.FINALIZADO:
        raise ValidationError("No se puede eliminar un proceso FINALIZADO.")

    anio = proceso.pa_anio
    semestre = proceso.pa_num_semestre

    # 3) Borrar ASIGNACIONES de ese año/semestre
    Asignacion.objects.filter(
        anio=anio,
        asi_num_semestre=semestre,
    ).delete()

    # 4) Borrar PERFILES ACADÉMICOS de ese año/semestre
    PerfilAcademico.objects.filter(
        perfil_anio=anio,
        perfil_semestre=semestre,
    ).delete()

    # 5) Borrar el PROCESO DE ASIGNACIÓN
    proceso.delete()