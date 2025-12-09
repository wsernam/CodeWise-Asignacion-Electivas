import json
import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import smtplib
from email.mime.image import MIMEImage


def send_html_email_with_logo(data):
    """
    Envía correos para:
    - Selección de electivas (template_email_seleccion.html)
    - Asignación de electivas (template_email_asignacion.html)

    Detecta automáticamente el tipo:
    - Si los ítems tienen "estado" => ASIGNACIÓN
    - Si tienen "sel_prioridad" => SELECCIÓN
    """

    try:
        # ===============================
        # 1) DESTINATARIO
        # ===============================
        destinatario = data.get("correo") or data.get("est_correo")
        if not destinatario:
            raise ValueError("No se encontró un campo de correo válido.")

        # ===============================
        # 2) ELECTIVAS Y DETECCIÓN DEL TIPO DE CORREO
        # ===============================
        electivas = data.get("electivas") or data.get("selecciones") or []

        es_asignacion = False
        if electivas and isinstance(electivas, list):
            if "estado" in electivas[0]:   # detecta asignación
                es_asignacion = True

        # ===============================
        # 3) SELECCIÓN DEL TEMPLATE + ASUNTO
        # ===============================
        if es_asignacion:
            template = "template_email_asignacion.html"
            asunto = f"Asignación de Electivas – Período {data['sel_anio']}-{data['sel_num_semestre']}"
        else:
            template = "template_email_seleccion.html"
            asunto = f"Selección de Electivas – Período {data['sel_anio']}-{data['sel_num_semestre']}"

        # ===============================
        # 4) CONTEXTO PARA EL TEMPLATE
        # ===============================
        context = {
            "est_codigo": data.get("est_codigo"),
            "sel_anio": data.get("sel_anio"),
            "sel_num_semestre": data.get("sel_num_semestre"),
            "electivas": electivas,
        }

        # ===============================
        # 5) HTML Y TEXTO ALTERNATIVO
        # ===============================
        html_content = render_to_string(template, context)
        text_content = "Este correo requiere un cliente compatible con HTML."

        # ===============================
        # 6) CREAR MENSAJE MULTIPARTE
        # ===============================
        msg = EmailMultiAlternatives(
            subject=asunto,
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[destinatario],
        )

        msg.attach_alternative(html_content, "text/html; charset=utf-8")
        msg.encoding = "utf-8"
        msg.extra_headers = {"Content-Type": "text/html; charset=utf-8"}

        # ===============================
        # 7) LOGO CON CID
        # ===============================
        logo_path = os.path.join(settings.BASE_DIR, "static", "escudo_unicauca.png")

        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read())
                img.add_header("Content-ID", "<escudo_unicauca>")
                img.add_header("Content-Disposition", "inline", filename="escudo_unicauca.png")
                msg.attach(img)
        else:
            print(f"⚠️ Logo no encontrado en {logo_path}")

        # ===============================
        # 8) CONEXIÓN SMTP
        # ===============================
        if getattr(settings, "EMAIL_USE_SSL", False):
            connection = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
        else:
            connection = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            if getattr(settings, "EMAIL_USE_TLS", False):
                connection.starttls()

        connection.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

        # ===============================
        # 9) ENVIAR EN BYTES (UTF-8 REAL)
        # ===============================
        raw_message = msg.message().as_bytes()
        connection.sendmail(settings.EMAIL_HOST_USER, [destinatario], raw_message)
        connection.quit()

        print(f"Correo enviado a {destinatario} (asignación={es_asignacion})")

    except Exception as e:
        print(f"Error al enviar correo: {e}")
