from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer
from .serializers import ReporteSeleccionElectivasSerializer, ReporteOfertaElectivasSerializer
from django.db.models.query import QuerySet
from seleccion_electivas.models import SeleccionEstudianteElectiva
from django.db.models import Count, F
from .generador_graficas import generar_grafico_pastel, generar_grafico_barras
from gestion_oferta_electiva.models import Oferta_electiva
from datetime import datetime
import pytz
class GeneradorContenidoReporteSeleccion:
    
    def __init__(self, datos_reporte: ReporteSeleccionElectivasSerializer):
        self.datos_reporte = datos_reporte

    def generar_contenido(self):
        """
        Genera el contenido del reporte en formato Platypus.
        :return: lista de elementos (Flowables)
        """
        elementos = []
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Texto', fontSize=12, leading=16))

        #Obtener los datos serializados correctamente
        datos_seleccion = self.datos_reporte.data

        estudiante = datos_seleccion.get("estudiante", {})
        electivas = datos_seleccion.get("electivas", [])
        anio = datos_seleccion.get("sel_anio")
        semestre = datos_seleccion.get("sel_num_semestre")

        # --- Mensaje principal ---
        mensaje = (
            f"El estudiante {estudiante.get('est_nombre', '')} {estudiante.get('est_apellido', '')},"
            f" identificado con codigo <b>{estudiante.get('est_codigo', '')}</b> del programa <b>{estudiante.get('pro_nombre', '')}</b> "
            f"realizó la siguiente selección de electivas para el periodo académico "
            f"<b>{anio}-{semestre}</b>:"
        )

        elementos.append(Spacer(1, 2 * cm))
        elementos.append(Paragraph(mensaje, styles["Texto"]))
        elementos.append(Spacer(1, 1 * cm))

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
                e.get("ele_codigo", ""),
                e.get("ele_nombre", ""),
                e.get("sel_prioridad", ""),
            ])

        # Crear tabla con estilo
        tabla = Table(data, colWidths=[4 * cm, 9 * cm, 3 * cm])
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


class GenerardorContenidoReporteOferta:
    def __init__(self, datos_reporte: ReporteOfertaElectivasSerializer):
        self.datos_reporte = datos_reporte

    def agregar_espacios(self,elementos, mensaje, style, estilo):
         elementos.append(Spacer(1, 2 * cm))
         elementos.append(Paragraph(mensaje, style[estilo]))
         elementos.append(Spacer(1, 1 * cm))

         return elementos
    def generar_contenido(self):
        """
        Genera el contenido del reporte en formato Platypus.
        :return: lista de elementos (Flowables)
        """
        elementos = []
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Texto', fontSize=12, leading=16))

        #Obtener los datos serializados correctamente
        datos_oferta = self.datos_reporte.data
        print("Data:",datos_oferta)
        ofertas_programas = datos_oferta.get("ofertas_programas", [])
        anio = datos_oferta.get('ofe_anio')
        semestre = datos_oferta.get('ofe_num_semestre')
        programas = []
        for oferta in ofertas_programas:
            programas.append(oferta.get("pro_nombre"))
        mensaje = (
            f"Este informe posee la oferta de electivas del periodo academico <b>{anio}-{semestre}</b>"
            f" correspondiente a los programas de pregrado: {', '.join(programas)}."
        )

        elementos = self.agregar_espacios(elementos,mensaje,styles,"Texto")

        for oferta in ofertas_programas:
            elementos.append(Spacer(1, 2 * cm))
            sub_titulo_programa = oferta.get("pro_nombre")
            elementos = self.agregar_espacios(elementos,sub_titulo_programa,styles,"Heading2")
            electivas = oferta.get("electivas",[])
            
            # Encabezados de tabla
            encabezados = ["Código", "Nombre", "Cod programa"]
            data = [encabezados]

            # Filas de datos
            for e in electivas:
                data.append([
                    e.get("ele_codigo", ""),
                    e.get("ele_nombre", ""),
                    e.get("pro_codigo", ""),
                ])

            # Crear tabla con estilo
            tabla = Table(data, colWidths=[4 * cm, 9 * cm, 3 * cm])
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


class GeneradorContenidoReporteGeneralSeleccion:
    def __init__(self, datos_reporte: QuerySet[SeleccionEstudianteElectiva]):
        self.datos_reporte = datos_reporte

    def agregar_espacios(self,elementos, mensaje, style, estilo):
        elementos.append(Spacer(1, 1 * cm))
        elementos.append(Paragraph(mensaje, style[estilo]))
        elementos.append(Spacer(1, 1 * cm))

        return elementos
    
    def generar_contenido(self):
        """
        Genera el contenido del reporte en formato Platypus.
        :return: lista de elementos (Flowables)
        """
        elementos = []
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Texto', fontSize=12, leading=16))
        anio = self.datos_reporte.first().sel_anio
        semestre = self.datos_reporte.first().sel_num_semestre
        zona = pytz.timezone('America/Bogota')
        fecha = datetime.now(zona).strftime("%d/%m/%Y a las %H:%M")
        mensaje = (
            f"Este informe contiene las metricas del proceso de seleccion correspondiente al periodo academico <b>{anio}-{semestre}</b>"
            f" con corte en el {fecha}."
        )
        elementos = self.agregar_espacios(elementos,mensaje,styles,"Texto")
        #Consultar la proporcion de programas que realizaron la seleccion
        conteo_programas = (
            self.datos_reporte
            .values(codigo_programa=F('est_codigo__pro_codigo'),nombre_programa=F('est_codigo__pro_codigo__pro_nombre'))
            .annotate(total_estudiantes=Count('est_codigo', distinct=True))
            .order_by('nombre_programa')
        )
        #generar la grafica
        grafico_pastel = generar_grafico_pastel(conteo_programas,ancho=400,alto=300)
        elementos.append(grafico_pastel)
        #generar la tabla de la grafica
        encabezados = ["Código", "Programa", "Cant"]
        data = [encabezados]
        
        for registro in conteo_programas:
            data.append([
            registro["codigo_programa"],
            registro["nombre_programa"],
            registro["total_estudiantes"],
         ])

         # Crear tabla con estilo
        tabla = Table(data, colWidths=[4 * cm, 9 * cm, 3 * cm])
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
        #Electivas por programa y la cantidad de estudiantes por programa que la selecionaron
        for programa in conteo_programas:
            nombre_programa = programa["nombre_programa"]
            codigo_programa = programa["codigo_programa"]
            elementos = self.agregar_espacios(elementos,nombre_programa,styles,"Heading2")
            selecciones_programa = self.datos_reporte.filter(ele_codigo__pro_codigo=codigo_programa)

            electivas = (
                selecciones_programa
                .values(
                    codigo=F('ele_codigo__ele_codigo'),
                    nombre=F('ele_codigo__ele_nombre')
                )
                .distinct()
            )

            for ele in electivas:
                nombre_electiva = ele["nombre"]
                elementos = self.agregar_espacios(elementos,nombre_electiva,styles,"Heading3")
                selecciones_electivas = selecciones_programa.filter(ele_codigo=ele["codigo"])
                conteo_electivas = (
                    selecciones_electivas
                    .values(cod_programa=F('est_codigo__pro_codigo'),nombre_programa=F('est_codigo__pro_codigo__pro_nombre'))
                    .annotate(total_estudiantes=Count('est_codigo', distinct=True))
                    .order_by('nombre_programa')
                )
                diagrama_barras = generar_grafico_barras(nombre_electiva,conteo_electivas,ancho=320, alto=180)
                elementos.append(diagrama_barras)
                encabezados = ["Programa", "Estudiantes"]
                data = [encabezados]
                
                for registro in conteo_electivas:
                    data.append([
                    registro["nombre_programa"],
                    registro["total_estudiantes"]
                ])

                # Crear tabla con estilo
                tabla = Table(data, colWidths=[4 * cm, 9 * cm, 3 * cm])
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


                        




         
    
