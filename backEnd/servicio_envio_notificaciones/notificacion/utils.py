import json
import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import smtplib
from email.mime.image import MIMEImage


def send_html_email_with_logo(data):
    """
    data viene con algo como:
    {
        "est_codigo": ...,
        "sel_anio": ...,
        "sel_num_semestre": ...,
        "est_correo" o "correo": "...",
        "selecciones" o "electivas": [ ... ]
    }
    """
    try:
        # 1) Destinatario (soporta 'correo' o 'est_correo')
        raw_email = data.get("correo") or data.get("est_correo")
        destinatario = raw_email

        # 2) Armar contexto para la plantilla
        context = {
            "est_codigo": data.get("est_codigo"),
            "sel_anio": data.get("sel_anio"),
            "sel_num_semestre": data.get("sel_num_semestre"),
            # lo importante: mapear 'selecciones' -> 'electivas'
            "electivas": data.get("electivas") or data.get("selecciones") or [],
        }

        asunto = f"Selección de Electivas - Período {context['sel_anio']}-{context['sel_num_semestre']}"

        logo_path = os.path.join(settings.BASE_DIR, "static", "escudo_unicauca.png")

        # Render del HTML con el contexto correcto
        html_content = render_to_string("template_email.html", context)
        text_content = "Este correo requiere un cliente compatible con HTML."

        msg = EmailMultiAlternatives(
            subject=asunto,
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[destinatario],
            alternatives=[(html_content, "text/html; charset=utf-8")]
        )
        msg.encoding = 'utf-8'

        # Adjuntar logo
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read())
                img.add_header("Content-ID", "<escudo_unicauca>")
                img.add_header("Content-Disposition", "inline", filename="escudo_unicauca.png")
                msg.attach(img)
        else:
            print(f"⚠️ No se encontró el archivo de logo en: {logo_path}")

        # Enviar correo
        if getattr(settings, "EMAIL_USE_SSL", False):
            connection = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
        else:
            connection = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            if getattr(settings, "EMAIL_USE_TLS", False):
                connection.starttls()

        connection.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        connection.sendmail(settings.EMAIL_HOST_USER, [destinatario], msg.message().as_string())
        connection.quit()

        print(f"✅ Correo enviado correctamente a {destinatario}")

    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")

