# asignacion/services/notificacion_asignacion_service.py

from collections import defaultdict
from django.utils import timezone

from asignacion.models import Asignacion
from events.notificacion_publisher import publish_notificacion_asignacion


def enviar_notificaciones_asignacion_periodo(anio: int, semestre: int, pro_codigo: str | None = None) -> int:
    """
    Envía un correo por estudiante con sus electivas asignadas
    (cupo firme y lista de espera) para el periodo dado.

    Solo notifica a estudiantes que tengan al menos una fila en Asignacion.
    Devuelve cuántas notificaciones se enviaron.
    """

    # 1) Traer asignaciones del periodo
    qs = Asignacion.objects.filter(anio=anio, asi_num_semestre=semestre)

    # Si quieres restringir a un solo programa
    if pro_codigo:
        qs = qs.filter(est_codigo__pro_codigo__pro_codigo=pro_codigo)

    qs = qs.select_related("ele_codigo", "est_codigo", "est_codigo__pro_codigo")

    if not qs.exists():
        # No hay nada asignado para este periodo/programa
        return 0

    # 2) Agrupar por estudiante: firmes / espera
    firmes = defaultdict(list)
    espera = defaultdict(list)
    estudiantes = {}  # est_id -> Estudiante

    for a in qs:
        est = a.est_codigo
        est_id = est.est_codigo
        estudiantes[est_id] = est

        payload_electiva = {
            "ele_codigo": a.ele_codigo.ele_codigo if a.ele_codigo_id else a.ele_codigo_id,
            "ele_nombre": getattr(a.ele_codigo, "ele_nombre", None),
        }

        if getattr(a, "en_lista_espera", False):
            espera[est_id].append(payload_electiva)
        else:
            firmes[est_id].append(payload_electiva)

    # 3) Construir payload por estudiante y publicar en RabbitMQ
    enviados = 0
    now_str = timezone.now().strftime("%Y-%m-%d %H:%M:%S")

    for est_id, est in estudiantes.items():
        electivas_firmes = firmes.get(est_id, [])
        electivas_espera = espera.get(est_id, [])

        # Si por alguna razón no tiene ni firmes ni espera, no se envía nada
        if not electivas_firmes and not electivas_espera:
            continue

        # En este micro replicaste Estudiante con est_correo (EmailField)
        est_correo = getattr(est, "est_correo", None) or str(est.est_codigo)

        payload = {
            "tipo": "ASIGNACION_ELECTIVAS",
            "est_codigo": est.est_codigo,
            "sel_anio": anio,
            "sel_num_semestre": semestre,
            "est_correo": est_correo,
            "fecha": now_str,
            "electivas_firmes": electivas_firmes,
            "electivas_espera": electivas_espera,
        }

        publish_notificacion_asignacion(payload)
        enviados += 1

    return enviados
