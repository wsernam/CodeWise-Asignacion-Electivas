from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from datetime import datetime
import os
from io import BytesIO
# --- Configuración general ---
NOMBRE_ORGANIZACION = "Universidad del Cauca"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(BASE_DIR, "resources", "logo_unicauca.png")

def crear_pdf(nombre_archivo, contenido_func):
    """
    Genera un PDF con encabezado, pie de página y contenido dinámico.
    :param nombre_archivo: nombre del archivo PDF a generar.
    :param contenido_func: función que recibe el canvas y escribe el contenido.
    """
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer,nombre_archivo, pagesize=A4)
    ancho, alto = A4

    def dibujar_encabezado():
        # Logo (si existe)
        try:
            pdf.drawImage(LOGO_PATH, x=1.5*cm, y=alto - 3*cm, width=3*cm, height=3*cm, preserveAspectRatio=True)
        except Exception as e:
            print(f"No se pudo cargar el logo: {e}")

        # Nombre de la organización
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(5*cm, alto - 2*cm, NOMBRE_ORGANIZACION)

        # Línea separadora
        pdf.setLineWidth(1)
        pdf.line(1.5*cm, alto - 3.2*cm, ancho - 1.5*cm, alto - 3.2*cm)

    def dibujar_pie_pagina():
        fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
        pdf.setFont("Helvetica-Oblique", 9)
        pdf.drawString(1.5*cm, 1.5*cm, f"Generado el {fecha}")
        pdf.drawRightString(ancho - 1.5*cm, 1.5*cm, f"Página {pdf.getPageNumber()}")

    # --- Crear contenido con encabezado/pie en cada página ---
    def nueva_pagina():
        dibujar_encabezado()
        dibujar_pie_pagina()
        pdf.showPage()

    # Dibuja la primera página
    dibujar_encabezado()
    contenido_func(pdf, nueva_pagina, alto)
    dibujar_pie_pagina()


    pdf.showPage()
    pdf.save()


    pdf_data = buffer.getvalue()
    buffer.close()
    print(f"PDF generado: {nombre_archivo}")
    return pdf_data


