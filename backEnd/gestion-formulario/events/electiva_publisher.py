from common.rabbit import get_publisher

def publish_electiva_creada(electiva: dict):
    get_publisher().publish("electiva.creada", "electiva.creada", electiva)

def publish_electiva_actualizada(electiva: dict):
    get_publisher().publish("electiva.actualizada", "electiva.actualizada", electiva)

def publish_electiva_eliminada(electiva: dict):
    get_publisher().publish("electiva.eliminada", "electiva.eliminada", electiva)


def publish_electiva_estado_cambiado(electiva: dict):
    """
    Evento específico para cuando SOLO cambia el estado (ele_estado) de la electiva.
    """
    get_publisher().publish("electiva.estado_cambiado",
                            "electiva.estado_cambiado",
                            electiva)
