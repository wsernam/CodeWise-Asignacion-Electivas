# asignacion/events/notificacion_publisher.py
import json
import os
import pika

# Reutilizamos los mismos env vars que tu consumidor
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))

# Nombre de la cola donde está escuchando el micro de notificación.
RABBITMQ_NOTIF_QUEUE = os.getenv("RABBITMQ_NOTIF_QUEUE", "ms.notificacion.correos")


def _get_channel():
    """
    Abre una conexión a RabbitMQ y devuelve (conn, ch).
    El que llama se encarga de cerrar conn.
    """
    creds = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    params = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        virtual_host="/",
        credentials=creds,
        heartbeat=30,
    )
    conn = pika.BlockingConnection(params)
    ch = conn.channel()

    # Declaramos la cola por si no existe (misma idea que en config_rabbit.py del micro notificación)
    ch.queue_declare(queue=RABBITMQ_NOTIF_QUEUE, durable=True)

    return conn, ch


def publish_notificacion_asignacion(payload: dict):
    """
    Publica un mensaje con la información de asignación de electivas
    (firmes y lista de espera) hacia el microservicio de notificación.
    """
    conn, ch = _get_channel()
    try:
        body = json.dumps(payload)
        ch.basic_publish(
            exchange="",                    # default exchange
            routing_key=RABBITMQ_NOTIF_QUEUE,  # va directo a la cola
            body=body,
            properties=pika.BasicProperties(
                delivery_mode=2  # persistente
            )
        )
    finally:
        conn.close()
