import json
import pika
import django
import os
from django.conf import settings
from utils import send_html_email_with_logo

# Configura el entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notificador.settings')
django.setup()


def callback(ch, method, properties, body):
    """Procesa el mensaje recibido desde RabbitMQ y lo pasa al módulo de envío de correo."""
    print("Mensaje recibido desde RabbitMQ")

    try:
        data = json.loads(body)
        print(f"Contenido del mensaje: {data}")

        # Envía el correo usando la función utilitaria
        send_html_email_with_logo(data)
        print(f"Correo enviado correctamente a {data.get('to')}")

    except json.JSONDecodeError:
        print("Error: el mensaje recibido no es un JSON válido.")
    except Exception as e:
        print(f"Error al procesar o enviar el correo: {e}")


def main():
    """Conecta a RabbitMQ y escucha la cola configurada en settings."""

    credentials = pika.PlainCredentials(
        settings.RABBITMQ_USER,
        settings.RABBITMQ_PASSWORD
    )

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=settings.RABBITMQ_HOST,
            credentials=credentials
        )
    )

    channel = connection.channel()
    channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)

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
