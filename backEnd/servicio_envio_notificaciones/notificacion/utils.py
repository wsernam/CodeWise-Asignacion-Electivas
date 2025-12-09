import json
import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import smtplib
from email.mime.image import MIMEImage


def send_html_email_with_logo(data):
    """
    Envía correo HTML en UTF-8, con logo incrustado y plantilla dinámica.
    Compatible con tildes, ñ y cualquier caracter Unicode.
    """
    try:
        # 1) Email destino
        raw_email = data.get("correo") or data.get("est_correo")
        destinatario = raw_email

        # 2) Contexto para la plantilla
        context = {
            "est_codigo": data.get("est_codigo"),
            "sel_anio": data.get("sel_anio"),
            "sel_num_semestre": data.get("sel_num_semestre"),
            "electivas": data.get("electivas") or data.get("selecciones") or [],
        }

        asunto = f"Selección de Electivas - Período {context['sel_anio']}-{context['sel_num_semestre']}"

        # 3) Render HTML
        html_content = render_to_string("template_email.html", context)
        text_content = "Este correo requiere un cliente compatible con HTML."

        # 4) Crear mensaje base con texto plano
        msg = EmailMultiAlternatives(
            subject=asunto,
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[destinatario],
        )

        # 5) Adjuntar HTML en UTF-8
        msg.attach_alternative(html_content, "text/html; charset=utf-8")

        # 6) Forzar encabezados UTF-8
        msg.encoding = "utf-8"
        msg.extra_headers = {
            "Content-Type": "text/html; charset=utf-8"
        }

        # 7) Adjuntar logo embebido CID
        logo_path = os.path.join(settings.BASE_DIR, "static", "escudo_unicauca.png")
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read())
                img.add_header("Content-ID", "<escudo_unicauca>")
                img.add_header("Content-Disposition", "inline", filename="escudo_unicauca.png")
                msg.attach(img)
        else:
            print(f"⚠️ No se encontró el archivo de logo en: {logo_path}")

        # 8) Apertura SMTP
        if getattr(settings, "EMAIL_USE_SSL", False):
            connection = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
        else:
            connection = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            if getattr(settings, "EMAIL_USE_TLS", False):
                connection.starttls()

        # 8) Autenticación
        connection.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

        # 9) Construir el mensaje crudo en bytes (correctamente codificado)
        email_message = msg.message()          # EmailMessage de la stdlib
        raw_msg = email_message.as_bytes()     # ya respeta msg.encoding = "utf-8"

        # 10) Enviar
        connection.sendmail(
            settings.EMAIL_HOST_USER,
            [destinatario],
            raw_msg,
        )
        connection.quit()

        print(f"✅ Correo enviado correctamente a {destinatario}")


    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")
