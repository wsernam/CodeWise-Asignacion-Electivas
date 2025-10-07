import json, os, time, uuid
from datetime import datetime, timezone
import pika

class RabbitPublisher:
    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.user = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASS", "guest")
        self.exchange = os.getenv("RABBITMQ_EXCHANGE", "asignacion.electivas")
        self.connection = None
        self.channel = None

    def connect(self, retries=10, delay=3):
        creds = pika.PlainCredentials(self.user, self.password)
        params = pika.ConnectionParameters(self.host, self.port, '/', creds, heartbeat=30)
        for _ in range(retries):
            try:
                self.connection = pika.BlockingConnection(params)
                self.channel = self.connection.channel()
                self.channel.exchange_declare(exchange=self.exchange, exchange_type="topic", durable=True)
                return
            except pika.exceptions.AMQPConnectionError:
                time.sleep(delay)
        raise RuntimeError("No se pudo conectar a RabbitMQ")

    def _ensure(self):
        if not self.connection or self.connection.is_closed:
            self.connect()
        if not self.channel or self.channel.is_closed:
            self.channel = self.connection.channel()
            self.channel.exchange_declare(exchange=self.exchange, exchange_type="topic", durable=True)

    def publish(self, routing_key: str, event: str, data: dict, version: int = 1):
        self._ensure()
        body = {
            "event": event,
            "source": "formulario",
            "version": version,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
            "meta": {"trace_id": str(uuid.uuid4())},
        }
        props = pika.BasicProperties(
            content_type="application/json",
            delivery_mode=2,  # persistente
            type=event,
            message_id=body["meta"]["trace_id"],
        )
        self.channel.basic_publish(
            exchange=self.exchange,
            routing_key=routing_key,
            body=json.dumps(body).encode("utf-8"),
            properties=props,
            mandatory=False,
        )

_publisher = None
def get_publisher():
    global _publisher
    if _publisher is None:
        _publisher = RabbitPublisher(); _publisher.connect()
    return _publisher
