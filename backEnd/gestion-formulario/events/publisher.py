import pika
import json
from decouple import config
import logging

logger = logging.getLogger(__name__)

class Publisher:
    """
    Clase genérica para publicar eventos en RabbitMQ.
    """
    def __init__(self):
        """
        Inicializa la conexión y el canal con RabbitMQ.
        """
        try:
            # Lee las credenciales desde las variables de entorno
            credentials = pika.PlainCredentials(
                config('RABBITMQ_USER', default='guest'),
                config('RABBITMQ_PASS', default='guest')
            )
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=config('RABBITMQ_HOST', default='rabbitmq'),
                    credentials=credentials
                )
            )
            self.channel = self.connection.channel()
            
            # Declara el exchange si no existe. Usamos un exchange de tipo 'topic'
            # que es flexible para enrutar mensajes.
            self.exchange_name = 'eventos_formularios'
            self.channel.exchange_declare(exchange=self.exchange_name, exchange_type='topic', durable=True)
            
            logger.info(f"Publisher conectado a RabbitMQ y exchange '{self.exchange_name}' declarado.")

        except Exception as e:
            logger.error(f"Error al conectar con RabbitMQ: {e}")
            raise

    def publish(self, routing_key, body):
        """
        Publica un mensaje en el exchange con una clave de enrutamiento específica.
        """
        self.channel.basic_publish(
            exchange=self.exchange_name,
            routing_key=routing_key,
            body=json.dumps(body)
        )
        logger.info(f"Evento publicado con routing_key='{routing_key}': {body}")

    def close(self):
        """
        Cierra la conexión a RabbitMQ.
        """
        if self.connection and self.connection.is_open:
            self.connection.close()
            logger.info("Conexión de Publisher a RabbitMQ cerrada.")