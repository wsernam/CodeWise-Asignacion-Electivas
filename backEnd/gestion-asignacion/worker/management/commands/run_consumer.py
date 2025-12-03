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
    "programa.actualizado": os.getenv("Q_PROG_UPD", "ms.asignacion.programas.upd"),  
    "electiva.creada":   os.getenv("Q_ELEC", "ms.asignacion.electivas"),
    "electiva.estado_cambiado": os.getenv("Q_ELEC_EC", "ms.asignacion.electivas.ec"),
    "electiva.eliminada": os.getenv("Q_ELEC_DEL", "ms.asignacion.electivas.del"),
    "electiva.actualizada": os.getenv("Q_ELEC_UPD", "ms.asignacion.electivas.upd"),
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

def _process_programa(data: dict):
    """
    Sincroniza un Programa a partir del evento recibido.
    data típico:
    {
        "pro_codigo": "PIAI",
        "pro_nombre": "Ingeniería Automática",
        "fac_codigo": 1,
        "fac_nombre": "Facultad de Ingeniería",
        "pro_activo": true
    }
    """
    # 1) Quitar campos que NO existen en el modelo Programa de este micro
    data.pop("fac_nombre", None)   # 👈 ESTE CAMPO NO EXISTE AQUÍ

    pro_codigo = data.get("pro_codigo")
    if not pro_codigo:
        logger.error(f"[programa.creado] Evento sin pro_codigo: {data}")
        return

    Programa.objects.update_or_create(
        pro_codigo=pro_codigo,
        defaults=data,
    )
    logger.info(f"[programa.creado] Programa {pro_codigo} procesado.")

def _process_electiva(data: dict):
    """
    Sincroniza una Electiva a partir del evento recibido.
    data = {
        'ele_codigo': '121AA',
        'ele_nombre': 'adwadawd',
        'ele_estado': True,
        'pro_codigo': 'PIAI'
    }
    """
    ele_codigo = data.get("ele_codigo")
    if not ele_codigo:
        logger.error(f"[electiva.creada] Evento sin ele_codigo: {data}")
        return

    # Armamos defaults sin meter todo el dict a lo loco
    defaults = {
        "ele_nombre": data.get("ele_nombre", ""),
        "ele_estado": data.get("ele_estado", True),
    }

    # Resolver el Programa a partir de pro_codigo (string)
    pro_codigo = data.get("pro_codigo")
    if pro_codigo:
        try:
            programa = Programa.objects.get(pro_codigo=pro_codigo)
            defaults["pro_codigo"] = programa  # 👈 instancia, no string
        except Programa.DoesNotExist:
            logger.error(
                f"[electiva.creada] Programa con código {pro_codigo} no existe en este microservicio. "
                f"Evento: {data}"
            )
            # puedes decidir: return, o dejar la Electiva sin programa
            return

    Electiva.objects.update_or_create(
        ele_codigo=ele_codigo,
        defaults=defaults,
    )

    logger.info(f"[electiva.creada] Electiva {ele_codigo} procesada correctamente.")

def _process_electiva_estado_cambiado(data: dict):
    """
    Handler para electiva.estado_cambiado
    Solo actualiza ele_estado de una electiva existente.
    """
    ele_codigo = data.get("ele_codigo")
    ele_estado = data.get("ele_estado")

    if not ele_codigo:
        logger.error(f"[electiva.estado_cambiado] Evento sin ele_codigo: {data}")
        return

    if ele_estado is None:
        logger.error(f"[electiva.estado_cambiado] Evento sin ele_estado: {data}")
        return

    try:
        electiva = Electiva.objects.get(ele_codigo=ele_codigo)
    except Electiva.DoesNotExist:
        logger.error(
            f"[electiva.estado_cambiado] Electiva {ele_codigo} no existe en asignación. Evento: {data}"
        )
        return

    electiva.ele_estado = ele_estado
    electiva.save()

    logger.info(
        f"[electiva.estado_cambiado] Electiva {ele_codigo} ahora tiene ele_estado={ele_estado}"
    )

def _process_electiva_eliminada(data: dict):
    """
    Handler para electiva.eliminada.
    Elimina la electiva en el microservicio de asignación si existe.
    data = { "ele_codigo": "121AA", ... }
    """
    ele_codigo = data.get("ele_codigo")

    if not ele_codigo:
        logger.error(f"[electiva.eliminada] Evento sin ele_codigo: {data}")
        return

    try:
        electiva = Electiva.objects.get(ele_codigo=ele_codigo)
    except Electiva.DoesNotExist:
        logger.warning(
            f"[electiva.eliminada] Se intentó eliminar la electiva {ele_codigo}, "
            f"pero no existe en este microservicio. Evento: {data}"
        )
        return

    # Si hay FKs con on_delete=CASCADE (Ofertas, Selecciones, etc.),
    # Django se encargará de eliminarlas.
    electiva.delete()
    logger.info(f"[electiva.eliminada] Electiva {ele_codigo} eliminada correctamente.")

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
    "programa.actualizado": _process_programa,
    "electiva.creada": _process_electiva,
    "electiva.actualizada": _process_electiva,
    "electiva.estado_cambiado": _process_electiva_estado_cambiado,
    "electiva.eliminada": _process_electiva_eliminada,
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