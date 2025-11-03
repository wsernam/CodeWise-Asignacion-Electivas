import json, os, time, uuid
from datetime import datetime, timezone
import pika


class RabbitPublisher:
    """Publicador RabbitMQ seguro y con reconexión automática."""

    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.user = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASSWORD", "guest")
        self.exchange = os.getenv("RABBITMQ_EXCHANGE", "asignacion.electivas")

    def _connect(self, retries=5, delay=3):
        """Establece conexión nueva con RabbitMQ."""
        creds = pika.PlainCredentials(self.user, self.password)
        params = pika.ConnectionParameters(
            host=self.host,
            port=self.port,
            virtual_host="/",
            credentials=creds,
            heartbeat=30,  # pequeño, porque no mantenemos conexión viva
            blocked_connection_timeout=10,
        )

        for intento in range(retries):
            try:
                connection = pika.BlockingConnection(params)
                channel = connection.channel()
                channel.exchange_declare(exchange=self.exchange, exchange_type="topic", durable=True)
                return connection, channel
            except pika.exceptions.AMQPConnectionError:
                print(f"[RabbitPublisher] Falló conexión (intento {intento+1}/{retries}). Reintentando en {delay}s...")
                time.sleep(delay)

        raise RuntimeError("No se pudo conectar a RabbitMQ tras varios intentos.")

    def publish(self, routing_key: str, event: str, data: dict, version: int = 1):
        """Publica un evento y cierra la conexión inmediatamente."""
        connection, channel = None, None
        try:
            connection, channel = self._connect()
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
                delivery_mode=2,  # mensaje persistente
                type=event,
                message_id=body["meta"]["trace_id"],
            )

            channel.basic_publish(
                exchange=self.exchange,
                routing_key=routing_key,
                body=json.dumps(body).encode("utf-8"),
                properties=props,
                mandatory=False,
            )

            print(f"[RabbitPublisher] Mensaje publicado en '{routing_key}' con evento '{event}'")

        except Exception as e:
            print(f"[RabbitPublisher] Error publicando mensaje: {e}")

        finally:
            # ✅ Cierra conexión siempre
            try:
                if channel and channel.is_open:
                    channel.close()
                if connection and connection.is_open:
                    connection.close()
            except Exception:
                pass


# Singleton opcional (mantiene una instancia única del publicador)
_publisher = None

def get_publisher():
    global _publisher
    if _publisher is None:
        _publisher = RabbitPublisher()
    return _publisher
