from common.rabbit import get_publisher

def publish_programa_creado(programa: dict):
    get_publisher().publish("programa.creado", "programa.creado", programa)

def publish_programa_actualizado(programa: dict):
    get_publisher().publish("programa.actualizado", "programa.actualizado", programa)

def publish_programa_eliminado(programa: dict):
    get_publisher().publish("programa.eliminado", "programa.eliminado", programa)
