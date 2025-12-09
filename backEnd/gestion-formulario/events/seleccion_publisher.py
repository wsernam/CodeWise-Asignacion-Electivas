# seleccion_publisher.py
from common.rabbit import get_publisher
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def publish_seleccion_creada(seleccion: dict):
    """
    Publica un evento cuando se crea una selección.
    """
    get_publisher().publish("seleccion.creada", "seleccion.creada", seleccion)

def publish_seleccion_actualizada(seleccion: dict):
    """
    Publica un evento cuando se actualiza una selección.
    """
    get_publisher().publish("seleccion.actualizada", "seleccion.actualizada", seleccion)

def publish_seleccion_eliminada(seleccion: dict):
    """
    Publica un evento cuando se elimina una selección.
    """
    get_publisher().publish("seleccion.eliminada", "seleccion.eliminada", seleccion)


def publish_seleccion_creada_notificacion(data_notificacion: dict):
    """
    Evento especial SOLO para el micro de notificación.
    El consumer espera: { "source": ..., "timestamp": ..., "data": {...} }
    """
    envelope = {
        "source": "gestion-formulario",
        "timestamp": timezone.now().isoformat(),
        "data": data_notificacion,   # aquí va est_codigo, correo, selecciones, etc.
    }

    # 👇 OJO: aquí usamos argumentos POSICIONALES, igual que en los otros métodos
    get_publisher().publish(
        "seleccion.creada.notificacion",           # routing_key
        "seleccion.creada.notificacion",           # event_name
        envelope                                   # payload
    )
