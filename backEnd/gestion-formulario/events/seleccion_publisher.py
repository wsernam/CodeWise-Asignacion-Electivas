from common.rabbit import get_publisher

def publish_seleccion_creada(payload):
    """Publica un evento cuando se crea una selección."""
    publisher = get_publisher()
    publisher.publish(routing_key="seleccion.creada", event="seleccion.creada", data=payload)