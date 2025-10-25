import json
import pika
import django
import os
import time
import sys
from django.conf import settings
from utils import send_html_email_with_logo

# --- Agrega el directorio raíz del proyecto al PYTHONPATH ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# Configura el entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()


def callback(ch, method, properties, body):
    """Procesa el mensaje recibido desde RabbitMQ y lo pasa al módulo de envío de correo."""
    print("Mensaje recibido desde RabbitMQ")

    try:
        data = json.loads(body)
        print(f"Contenido del mensaje: {data}")

        # Envía el correo usando la función utilitaria
        send_html_email_with_logo(data)

    except json.JSONDecodeError:
        print("Error: el mensaje recibido no es un JSON válido.")
    except Exception as e:
        print(f"Error al procesar o enviar el correo: {e}")

def connect_rabbitmq(max_retries=10, delay=5):
    for attempt in range(max_retries):
        try:
            credentials = pika.PlainCredentials(
                settings.RABBITMQ_USER,
                settings.RABBITMQ_PASS
            )
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=settings.RABBITMQ_HOST,
                    port=settings.RABBITMQ_PORT,
                    credentials=credentials
                )
            )
            print("onexión exitosa a RabbitMQ.")
            return connection
        except pika.exceptions.AMQPConnectionError:
            print(f"Intento {attempt+1}/{max_retries}: no se pudo conectar. Reintentando en {delay}s...")
            time.sleep(delay)
    raise ConnectionError("No se pudo conectar a RabbitMQ después de varios intentos.")

def main():
    """Conecta a RabbitMQ y escucha la cola configurada en settings."""


    connection = connect_rabbitmq()

    channel = connection.channel()
    queue_name = settings.RABBITMQ_QUEUE
    channel.queue_declare(queue=queue_name, durable=True)
    exchange_name = settings.RABBITMQ_EXCHANGE
    channel.exchange_declare(exchange=exchange_name, exchange_type="topic", durable=True)

    channel.queue_declare(queue=queue_name, durable=True)

    channel.queue_bind(
        exchange=exchange_name,
        queue=queue_name,
        routing_key=queue_name  
    )   
    channel.basic_consume(
        queue=settings.RABBITMQ_QUEUE,
        on_message_callback=callback,
        auto_ack=True
    )

    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("\nEscucha detenida por el usuario.")
        channel.stop_consuming()
    finally:
        connection.close()
        print("Conexión a RabbitMQ cerrada.")


if __name__ == "__main__":
    main()
