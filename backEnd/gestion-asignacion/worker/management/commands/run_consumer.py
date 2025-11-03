import json, os, time, logging
import pika
from django.core.management.base import BaseCommand
from django.db import transaction

# Importamos los modelos de la app 'referencias'
from referencias.models import Estudiante, Programa, Electiva, Oferta, SeleccionEstudianteElectiva

logger = logging.getLogger(__name__)

EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "asignacion.electivas")
DLX      = os.getenv("RABBITMQ_DLX", "asignacion.electivas.dlx")
QUEUES = {
    # Routing Key: Queue Name
    "estudiante.creado": os.getenv("Q_EST", "ms.asignacion.estudiantes"),
    "programa.creado":   os.getenv("Q_PROG", "ms.asignacion.programas"),
    "electiva.creada":   os.getenv("Q_ELEC", "ms.asignacion.electivas"),
    "oferta.creada":     os.getenv("Q_OFER", "ms.asignacion.ofertas"),
    "oferta.actualizada": os.getenv("Q_OFER_UPD", "ms.asignacion.ofertas.upd"),
    "oferta.eliminada":  os.getenv("Q_OFER_DEL", "ms.asignacion.ofertas.del"),
    "seleccion.creada":  os.getenv("Q_SEL", "ms.asignacion.selecciones"),
}

def _process_estudiante(data):
    # El payload de estudiante tiene un pro_codigo (ID), no la instancia.
    # Lo manejamos para evitar errores de FK.
    programa_id = data.pop('pro_codigo', None)
    if programa_id:
        data['pro_codigo_id'] = programa_id
    
    Estudiante.objects.update_or_create(
        est_codigo=data['est_codigo'],
        defaults=data
    )
    logger.info(f"Estudiante {data['est_codigo']} procesado.")

def _process_programa(data):
    Programa.objects.update_or_create(
        pro_codigo=data['pro_codigo'],
        defaults=data
    )
    logger.info(f"Programa {data['pro_codigo']} procesado.")

def _process_electiva(data):
    Electiva.objects.update_or_create(
        ele_codigo=data['ele_codigo'],
        defaults=data
    )
    logger.info(f"Electiva {data['ele_codigo']} procesada.")

def _process_oferta(data):
    # Manejamos los FKs para que no intente asignar un objeto completo.
    ele_id = data.pop('ele_codigo', None)
    prog_id = data.pop('pro_codigo', None)
    if ele_id: data['ele_codigo_id'] = ele_id
    if prog_id: data['pro_codigo_id'] = prog_id

    Oferta.objects.update_or_create(
        ofe_codigo=data['ofe_codigo'],
        defaults=data
    )
    logger.info(f"Oferta {data['ofe_codigo']} procesada.")

def _process_oferta_eliminada(data):
    try:
        oferta = Oferta.objects.get(ofe_codigo=data['ofe_codigo'])
        oferta.delete()
        logger.info(f"Oferta {data['ofe_codigo']} eliminada.")
    except Oferta.DoesNotExist:
        logger.warning(f"Se intentó eliminar la oferta {data['ofe_codigo']}, pero no fue encontrada.")

def _process_seleccion(data):
    # Manejamos los FKs para que no intente asignar un objeto completo.
    est_id = data.pop('est_codigo', None)
    ele_id = data.pop('ele_codigo', None)
    if est_id: data['est_codigo_id'] = est_id
    if ele_id: data['ele_codigo_id'] = ele_id

    SeleccionEstudianteElectiva.objects.update_or_create(
        sel_codigo=data['sel_codigo'],
        defaults=data
    )
    logger.info(f"Selección {data['sel_codigo']} procesada.")

# Mapeo de eventos a funciones de procesamiento
EVENT_HANDLERS = {
    "estudiante.creado": _process_estudiante,
    "programa.creado": _process_programa,
    "electiva.creada": _process_electiva,
    "oferta.creada": _process_oferta,
    "oferta.actualizada": _process_oferta,
    "oferta.eliminada": _process_oferta_eliminada,
    "seleccion.creada": _process_seleccion,
}

def process_message(event, data):
    logger.info(f"[CONSUMER] Recibido evento '{event}' con datos: {data}")
    handler = EVENT_HANDLERS.get(event)
    if not handler:
        logger.warning(f"Evento '{event}' no reconocido. Mensaje ignorado.")
        return
    try:
        with transaction.atomic():
            handler(data)
    except Exception as e:
        logger.error(f"Error procesando evento '{event}': {e}\nDatos: {data}")
        # Re-lanzamos la excepción para que el mensaje sea enviado a la DLQ.
        raise

def make_callback():
    def _callback(ch, method, props, body):
        try:
            msg = json.loads(body.decode())
            process_message(msg.get("event"), msg.get("data", {}))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            # Si process_message falla, hacemos nack y no re-encolamos.
            # La configuración de la cola lo enviará a la DLX.
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    return _callback

class Command(BaseCommand):
    help = 'Inicia el consumidor de RabbitMQ para el microservicio de asignación.'

    def handle(self, *args, **options):
        self.stdout.write("Iniciando consumidor de RabbitMQ...")
        
        creds = pika.PlainCredentials(os.getenv("RABBITMQ_USER","guest"), os.getenv("RABBITMQ_PASSWORD","guest"))
        params = pika.ConnectionParameters(os.getenv("RABBITMQ_HOST","rabbitmq"), int(os.getenv("RABBITMQ_PORT","5672")), '/', creds, heartbeat=30)

        while True:
            try:
                conn = pika.BlockingConnection(params)
                ch = conn.channel()

                ch.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
                ch.exchange_declare(exchange=DLX, exchange_type="topic", durable=True)

                for rk, q_name in QUEUES.items():
                    args = {"x-dead-letter-exchange": DLX, "x-dead-letter-routing-key": f"dlq.{rk}"}
                    ch.queue_declare(queue=q_name, durable=True, arguments=args)
                    ch.queue_bind(exchange=EXCHANGE, queue=q_name, routing_key=rk)
                    dlq = f"{q_name}.dlq"; ch.queue_declare(queue=dlq, durable=True)
                    ch.queue_bind(exchange=DLX, queue=dlq, routing_key=f"dlq.{rk}")

                ch.basic_qos(prefetch_count=10)
                callback = make_callback()
                for q in QUEUES.values():
                    ch.basic_consume(queue=q, on_message_callback=callback)
                
                self.stdout.write(self.style.SUCCESS("[*] Consumidor listo. Esperando mensajes..."))
                ch.start_consuming()
            except pika.exceptions.AMQPConnectionError as e:
                self.stderr.write(f"Error de conexión con RabbitMQ: {e}. Reintentando en 5 segundos...")
                time.sleep(5)
            except KeyboardInterrupt:
                self.stdout.write("Consumidor detenido.")
                break