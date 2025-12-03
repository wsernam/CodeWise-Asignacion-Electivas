from .publisher import Publisher
import logging

logger = logging.getLogger(__name__)

def publish_seleccion_creada(body):
    """
    Publica un evento cuando se crea una selección.
    (Actualmente no se usa, pero se mantiene por si es necesario en el futuro).
    """
    publisher = Publisher()
    publisher.publish(routing_key='seleccion.creada', body=body)
    publisher.close()

def publish_seleccion_actualizada(body):
    """
    Publica un evento cuando la selección de un estudiante es actualizada.
    """
    publisher = Publisher()
    publisher.publish(routing_key='seleccion.actualizada', body=body)
    publisher.close()