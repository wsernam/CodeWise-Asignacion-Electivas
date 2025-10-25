from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer
from .serializers import ReporteSeleccionElectivasSerializer


class GeneradorContenidoReporteSeleccion:
    
    def __init__(self, datos_reporte: ReporteSeleccionElectivasSerializer):
        self.datos_reporte = datos_reporte

    def generar_contenido(self):
        """
        Genera el contenido del reporte en formato Platypus.
        :param datos: diccionario con estructura del serializer
        :return: lista de elementos (Flowables)
        """
        elementos = []
        styles = getSampleStyleSheet()

        # Estilo personalizado para el texto principal
        styles.add(ParagraphStyle(name='Texto', fontSize=12, leading=16))

        estudiante = self.datos_reporte.estudiante
        electivas = self.datos_reporte.electivas
        anio = self.datos_reporte.sel_anio
        semestre = self.datos_reporte.sel_num_semestre



        # --- Mensaje principal ---
        mensaje = (
            f"El estudiante <b>{estudiante.est_nombre} {estudiante.est_apellido}</b> del programa <b>{estudiante.pro_codigo.pro_codigo}</b> "
            f"realizó la siguiente selección de electivas para el periodo académico "
            f"<b>{anio}-{semestre}</b>:"
        )
        elementos.append(Spacer(1, 2*cm))
        elementos.append(Paragraph(mensaje, styles["Texto"]))
        elementos.append(Spacer(1, 1*cm))

        # --- Tabla de electivas ---
        if not electivas:
            elementos.append(Paragraph("No se encontraron electivas seleccionadas.", styles["Texto"]))
            return elementos

        # Encabezados de tabla
        encabezados = ["Código", "Nombre", "Prioridad"]
        data = [encabezados]

        # Filas de datos
        for e in electivas:
            data.append([
                e.ele_codigo,
                e.ele_nombre,
                e.sel_prioridad,
            ])

        # Crear tabla
        tabla = Table(data, colWidths=[4*cm, 9*cm, 3*cm])
        tabla.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#003366")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ]))
        elementos.append(tabla)

        return elementos
