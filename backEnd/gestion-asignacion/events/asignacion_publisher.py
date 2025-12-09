# events/asignacion_publisher.py
import logging
from django.utils import timezone
from events.rabbit_publisher import get_publisher

logger = logging.getLogger(__name__)
 
def publish_asignacion_notificacion(data_notificacion: dict):
    """ 
    Evento para notificar al micro de notificación
    que a un estudiante se le han ASIGNADO electivas.

    data_notificacion:
    {
        "est_codigo": ...,
        "correo": ...,
        "sel_anio": ...,
        "sel_num_semestre": ...,
        "electivas": [
            {"ele_codigo": ..., "ele_nombre": ..., "estado": "FIRME"/"ESPERA"}
        ]
    }
    """
    envelope = {
        "source": "gestion-asignacion",
        "timestamp": timezone.now().isoformat(),
        "data": data_notificacion,
    }

    get_publisher().publish(
        "asignacion.creada.notificacion",        # routing_key
        "asignacion.creada.notificacion",        # event_name
        envelope
    )
    logger.info(
        f"[publish_asignacion_notificacion] Evento enviado para est {data_notificacion.get('est_codigo')}"
    )
