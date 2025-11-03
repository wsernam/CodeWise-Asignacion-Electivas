from common.rabbit import get_publisher

def publish_electiva_creada(electiva: dict):
    get_publisher().publish("electiva.creada", "electiva.creada", electiva)

def publish_electiva_actualizada(electiva: dict):
    get_publisher().publish("electiva.actualizada", "electiva.actualizada", electiva)

def publish_electiva_eliminada(electiva: dict):
    get_publisher().publish("electiva.eliminada", "electiva.eliminada", electiva)
