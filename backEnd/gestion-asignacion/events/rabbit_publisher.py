import os
import json
import logging
import pika

logger = logging.getLogger(__name__)

# Puedes usar las mismas variables de entorno que en otros micros
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "asignacion.electivas")


class RabbitPublisher:
    def __init__(self):
        params = pika.URLParameters(RABBITMQ_URL)
        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()

        # Aseguramos el exchange
        self.channel.exchange_declare(
            exchange=EXCHANGE,
            exchange_type="topic",
            durable=True,
        )

    def publish(self, routing_key: str, event_name: str, payload: dict):
        body = json.dumps(payload)
        self.channel.basic_publish(
            exchange=EXCHANGE,
            routing_key=routing_key,
            body=body,
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,
                headers={"event_name": event_name},
            ),
        )
        logger.info(
            f"[RabbitPublisher] Enviado evento '{event_name}' "
            f"routing_key='{routing_key}' payload={payload}"
        )

    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()


_publisher = None


def get_publisher() -> RabbitPublisher:
    global _publisher
    if _publisher is None or _publisher.connection.is_closed:
        _publisher = RabbitPublisher()
    return _publisher
