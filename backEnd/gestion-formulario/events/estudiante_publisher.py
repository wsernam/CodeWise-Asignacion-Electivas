from common.rabbit import get_publisher

def publish_estudiante_creado(estudiante: dict):
    get_publisher().publish("estudiante.creado", "estudiante.creado", estudiante)

def publish_estudiante_actualizado(estudiante: dict):
    get_publisher().publish("estudiante.actualizado", "estudiante.actualizado", estudiante)

def publish_estudiante_eliminado(estudiante: dict):
    get_publisher().publish("estudiante.eliminado", "estudiante.eliminado", estudiante)
