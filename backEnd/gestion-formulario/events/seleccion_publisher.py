# seleccion_publisher.py
from common.rabbit import get_publisher
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
