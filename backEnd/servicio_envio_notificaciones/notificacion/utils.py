import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import smtplib
from email.mime.image import MIMEImage


def send_html_email_with_logo(data):
    """
    Envía un correo HTML con logo embebido y CSS externo incrustado (inline).
    
    Espera un diccionario con:
        {
            "est_codigo": 1,
            "sel_anio": 2026,
            "sel_num_semestre": 1,
            "est_correo": "ashleecampaz",
            "fecha": "2024-10-01 10:00:00",
            "electivas": 
            [
                { "ele_codigo": 2, "sel_prioridad": 1 , "ele_nombre": "Redes Avanzadas"},
                { "ele_codigo": 3, "sel_prioridad": 2 , "ele_nombre": "Inteligencia Artificial"},
                { "ele_codigo": 5, "sel_prioridad": 3 , "ele_nombre": "Sistemas Embebidos"}
            ]
        }
    """
    try:
        # Obtiene el destinatario desde el diccionario
        destinatario = f"{data.get('est_correo')}@unicauca.edu.co"
        asunto = f"Selección de Electivas - Período {data.get('sel_anio')}-{data.get('sel_num_semestre')}"
        cuerpo = data

        # --- Rutas de plantilla y CSS ---
        logo_path = os.path.join(settings.BASE_DIR, "static", "escudo_unicauca.png")

        # --- Renderiza HTML con contexto ---
        html_content = render_to_string("template_email.html", cuerpo)

        # --- Versión de texto alternativo (para clientes sin HTML) ---
        text_content = "Este correo requiere un cliente compatible con HTML."

        # --- Crea el correo ---
        msg = EmailMultiAlternatives(
            subject=asunto,
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[destinatario],
            alternatives=[(html_content, "text/html; charset=utf-8")]
        )

        msg.encoding = 'utf-8'

        # --- Adjunta logo usando Content-ID ---
        logo_path = os.path.join(settings.BASE_DIR, "static", "escudo_unicauca.png")
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read())
                img.add_header("Content-ID", "<escudo_unicauca>")
                img.add_header("Content-Disposition", "inline", filename="escudo_unicauca.png")
                msg.attach(img)
        else:
            print(f"⚠️ No se encontró el archivo de logo en: {logo_path}")

        # --- Envío usando las variables de entorno configuradas en settings ---
        if getattr(settings, "EMAIL_USE_SSL", False):
            connection = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
        else:
            connection = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            if getattr(settings, "EMAIL_USE_TLS", False):
                connection.starttls()

        # Autenticación
        connection.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        connection.sendmail(settings.EMAIL_HOST_USER, [destinatario], msg.message().as_string())
        connection.quit()

        print(f"✅ Correo enviado correctamente a {destinatario}")

    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")
