import json, os, time
import pika

EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "asignacion.electivas")
DLX      = os.getenv("RABBITMQ_DLX", "asignacion.electivas.dlx")
QUEUES = {
    "estudiante.creado": os.getenv("Q_EST", "ms.asignacion.estudiantes"),
    "programa.creado":   os.getenv("Q_PROG", "ms.asignacion.programas"),
    "electiva.creada":   os.getenv("Q_ELEC", "ms.asignacion.electivas"),
    "oferta.creada":     os.getenv("Q_OFER", "ms.asignacion.ofertas"),
}

def get_conn():
    creds = pika.PlainCredentials(os.getenv("RABBITMQ_USER","guest"), os.getenv("RABBITMQ_PASS","guest"))
    params = pika.ConnectionParameters(os.getenv("RABBITMQ_HOST","rabbitmq"), int(os.getenv("RABBITMQ_PORT","5672")), '/', creds, heartbeat=30)
    return pika.BlockingConnection(params)

def setup_topology(ch):
    ch.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    ch.exchange_declare(exchange=DLX, exchange_type="topic", durable=True)

    def declare(q, rk):
        args = {"x-dead-letter-exchange": DLX, "x-dead-letter-routing-key": f"dlq.{rk}"}
        ch.queue_declare(queue=q, durable=True, arguments=args)
        ch.queue_bind(exchange=EXCHANGE, queue=q, routing_key=rk)
        dlq = f"{q}.dlq"
        ch.queue_declare(queue=dlq, durable=True)
        ch.queue_bind(exchange=DLX, queue=dlq, routing_key=f"dlq.{rk}")

    for rk, q in QUEUES.items():
        declare(q, rk)

def process_message(event, data):
    # Aquí tu lógica (persistencia local, cache, etc.)
    print(f"[OK] {event} -> {data}")

def make_cb():
    def _cb(ch, method, props, body):
        try:
            msg = json.loads(body.decode())
            process_message(msg.get("event"), msg.get("data", {}))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    return _cb

def main():
    while True:
        try:
            conn = get_conn(); ch = conn.channel()
            setup_topology(ch)
            ch.basic_qos(prefetch_count=16)
            cb = make_cb()
            for q in QUEUES.values():
                ch.basic_consume(queue=q, on_message_callback=cb, auto_ack=False)
            print("[*] Consumidor listo. Esperando mensajes…")
            ch.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            time.sleep(3)
        except KeyboardInterrupt:
            try: ch.stop_consuming()
            except Exception: pass
            break

if __name__ == "__main__":
    main()
