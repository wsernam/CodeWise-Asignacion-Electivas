from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from datetime import datetime
from reportlab.platypus import SimpleDocTemplate
import pytz
import os
from io import BytesIO
# --- Configuración general ---
NOMBRE_ORGANIZACION = "Universidad del Cauca"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(BASE_DIR, "resources", "logo_unicauca.png")

def crear_pdf(nombre_informe, elementos):
    """
    Genera un PDF con encabezado, pie de página y contenido dinámico.
    :param nombre_archivo: nombre del archivo PDF a generar.
    :param contenido_func: función que recibe el canvas y escribe el contenido.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=4 * cm,   # dejamos espacio para el encabezado
        bottomMargin=3 * cm  # dejamos espacio para el pie
    )
     # --- Función para dibujar encabezado ---
    def dibujar_encabezado(canvas, doc):
        ancho, alto = A4

        try:
            canvas.drawImage(LOGO_PATH, x=1.5 * cm, y=alto - 3 * cm, width=3 * cm, height=3 * cm, preserveAspectRatio=True)
        except Exception as e:
            print(f"No se pudo cargar el logo: {e}")

        canvas.setFont("Helvetica-Bold", 14)
        canvas.drawString(5 * cm, alto - 2 * cm, nombre_informe)

        # Línea separadora
        canvas.setLineWidth(1)
        canvas.line(1.5 * cm, alto - 3.2 * cm, ancho - 1.5 * cm, alto - 3.2 * cm)

    # --- Función para dibujar pie de página ---
    def dibujar_pie_pagina(canvas, doc):
        ancho, alto = A4
        zona = pytz.timezone('America/Bogota')
        fecha = datetime.now(zona).strftime("%d/%m/%Y %H:%M")

        canvas.setFont("Helvetica-Oblique", 9)
        canvas.drawString(1.5 * cm, 1.5 * cm, f"Generado el {fecha}")
        canvas.drawRightString(ancho - 1.5 * cm, 1.5 * cm, f"Página {canvas.getPageNumber()}")

    # --- Construir PDF con encabezado y pie de página ---
    doc.build(
        elementos,
        onFirstPage=lambda canvas, doc: (dibujar_encabezado(canvas, doc), dibujar_pie_pagina(canvas, doc)),
        onLaterPages=lambda canvas, doc: (dibujar_encabezado(canvas, doc), dibujar_pie_pagina(canvas, doc)),
    )

    pdf_data = buffer.getvalue()
    buffer.close()
    print(f"PDF generado: {nombre_informe}")
    return pdf_data


