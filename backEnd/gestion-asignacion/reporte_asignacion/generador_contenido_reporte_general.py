from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer,PageBreak,KeepTogether


from asignacion.models import Asignacion
from django.db.models.query import QuerySet, ValuesQuerySet
from django.db.models import Count, F
from referencias.models import Oferta


class GenerardorContenidoReporteGeneral:
    def __init__(self, datos_asignacion: QuerySet[Asignacion], datos_estudiantes_sin_electiva:ValuesQuerySet, datos_oferta: QuerySet[Oferta]):
        self.datos_asignacion = datos_asignacion
        self.datos_estudiantes_sin_electiva = datos_estudiantes_sin_electiva
        self.datos_oferta = datos_oferta

    def agregar_espacios(self, mensaje, style, estilo):
         elementos = []
         elementos.append(Spacer(1, 2 * cm))
         elementos.append(Paragraph(mensaje, style[estilo]))
         elementos.append(Spacer(1, 1 * cm))

         return elementos

    def generar_contenido(self):

        elementos = []
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Texto', fontSize=12, leading=16))

        anio = self.datos_asignacion.first().anio
        semestre = self.datos_asignacion.first().asi_num_semestre
        programas = self.datos_oferta.values_list("pro_codigo_pro_nombre",flat=True).distinct()

        mensaje = (f"Este informe posee la informacion del proceso de asignacion de electivas el periodo"
                    f"academico {anio}-{semestre} de los programas de pregrado: {', '.join(programas)}.")
        
        elementos.append(self.agregar_espacios(mensaje,styles,"Texto"))
        asignados = self.datos_asignacion.filter(en_lista_espera=False)
        lista_espera = self.datos_asignacion.filter(en_lista_espera=True)

        #Cuenta a los estudiantes a los que se les asignaron electivas por programa 
        conteo_asig_por_programa = (
            asignados
            .values(codigo_programa=F('est_codigo__pro_codigo'),nombre_programa=F('est_codigo__pro_codigo__pro_nombre'))
            .annotate(total_estudiantes=Count('est_codigo', distinct=True))
            .order_by('nombre_programa')
        )

        #Cuenta a los estudiantes que quedaron en lista de espera por programa 
        conteo_lista_esp_por_programa = (
            lista_espera
            .values(codigo_programa=F('est_codigo__pro_codigo'),nombre_programa=F('est_codigo__pro_codigo__pro_nombre'))
            .annotate(total_estudiantes=Count('est_codigo', distinct=True))
            .order_by('nombre_programa')
        )

    def generar_tabla(self, data):

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

        return tabla