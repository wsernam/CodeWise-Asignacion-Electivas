from common.rabbit import get_publisher

def publish_oferta_creada(oferta: dict):
    get_publisher().publish("oferta.creada", "oferta.creada", oferta)

def publish_oferta_actualizada(oferta: dict):
    get_publisher().publish("oferta.actualizada", "oferta.actualizada", oferta)

def publish_oferta_eliminada(oferta: dict):
    get_publisher().publish("oferta.eliminada", "oferta.eliminada", oferta)

