import os
import base64
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from email.mime.image import MIMEImage
from pathlib import Path
from django.conf import settings

BASE_DIR = Path(__file__).resolve().parent.parent

def send_html_email_with_logo(subject: str, to: list, context: dict, logo_path: str = None):
    """
    Envía un email HTML usando una plantilla. Inserta logo como imagen inline (CID).
    - subject: asunto
    - to: lista de destinatarios
    - context: contexto para la plantilla (por ejemplo: {"table_rows": [...], "user": "Vanessa"})
    - logo_path: ruta absoluta o relativa al archivo logo.png
    """

    # Renderiza HTML
    html_content = render_to_string("mailer/email_template.html", context)

    from_email = settings.DEFAULT_FROM_EMAIL
    msg = EmailMultiAlternatives(subject=subject, body="Tu cliente de correo no soporta HTML.", from_email=from_email, to=to)
    msg.attach_alternative(html_content, "text/html")

    # Adjunta logo como imagen inline si existe
    if logo_path:
        # Resuelve path relativo
        logo_file = Path(logo_path)
        if not logo_file.is_absolute():
            logo_file = Path(settings.BASE_DIR) / logo_file

        if logo_file.exists():
            with open(logo_file, 'rb') as f:
                img = MIMEImage(f.read())
                img.add_header('Content-ID', '<logo_cid>')
                img.add_header('Content-Disposition', 'inline', filename=logo_file.name)
                msg.attach(img)
        else:
            # Si no existe el logo, opcionalmente podrías subirlo a un host y usar una URL
            pass

    # Envía
    msg.send(fail_silently=False)
