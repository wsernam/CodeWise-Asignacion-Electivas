# asignacion/services/notificacion_asignacion_service.py

from collections import defaultdict
from django.utils import timezone

from asignacion.models import Asignacion

# en algún services/notificacion_asignacion.py
from collections import defaultdict
from asignacion.models import Asignacion  # ajusta el import
from events.asignacion_publisher import publish_asignacion_notificacion


def enviar_notificaciones_asignacion_periodo(anio: int, semestre: int, pro_codigo: str | None = None) -> int:
    qs = Asignacion.objects.select_related("est_codigo", "ele_codigo").filter(
        anio=anio,
        asi_num_semestre=semestre,
    )
    if pro_codigo:
        qs = qs.filter(est_codigo__pro_codigo__pro_codigo=pro_codigo)

    agrupado = defaultdict(list)

    for asi in qs:
        est = asi.est_codigo
        ele = asi.ele_codigo

        agrupado[est.pk].append(
            {
                "ele_codigo": getattr(ele, "ele_codigo", None),
                "ele_nombre": getattr(ele, "ele_nombre", None),
                "estado": getattr(asi, "asi_estado", "FIRME"),  # ajusta al nombre real
            }
        )

    enviados = 0
    for est_id, electivas in agrupado.items():
        est = qs.filter(est_codigo_id=est_id).first().est_codigo
        correo = getattr(est, "est_correo", None) or getattr(est, "email", None)
        if not correo:
            continue

        payload = {
            "est_codigo": getattr(est, "est_codigo", est_id),
            "correo": correo,
            "sel_anio": anio,
            "sel_num_semestre": semestre,
            "electivas": electivas,
        }

        publish_asignacion_notificacion(payload)
        enviados += 1

    return enviados
