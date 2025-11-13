from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer,PageBreak,KeepTogether


from asignacion.models import Asignacion
from django.db.models.query import QuerySet
from django.db.models import Count, F
from referencias.models import Oferta
from reporte_asignacion.generador_graficas import generar_grafico_barras_acumuladas, generar_grafico_pastel


class GenerardorContenidoReporteGeneral:
    def __init__(self, datos_asignacion: QuerySet[Asignacion], datos_estudiantes_sin_electiva, datos_oferta: QuerySet[Oferta]):
        self.datos_asignacion = datos_asignacion
        self.datos_estudiantes_sin_electiva = datos_estudiantes_sin_electiva
        self.datos_oferta = datos_oferta

    def agregar_espacios(self, mensaje, style, estilo):
         elementos = []
         elementos.append(Spacer(1, 2 * cm))
         elementos.append(Paragraph(mensaje, style[estilo]))
         elementos.append(Spacer(1, 1 * cm))

         return elementos

    def agregar_subtitulo(self, mensaje, style, estilo):
        elementos = []
        elementos.append(Spacer(0.5, 0.5 * cm))
        elementos.append(Paragraph(mensaje, style[estilo]))
        elementos.append(Spacer(0.1, 0.1 * cm))
        return elementos
    
    def generar_contenido(self):

        elementos = []
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Texto', fontSize=12, leading=16))

        anio = self.datos_asignacion.first().anio
        semestre = self.datos_asignacion.first().asi_num_semestre
        programas = self.datos_oferta.values_list("pro_codigo_pro_codigo","pro_codigo_pro_nombre").distinct()

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
        grafico_pastel_asig = generar_grafico_pastel(conteo_asig_por_programa,ancho=400,alto=300)
        elementos.append(grafico_pastel_asig)
        tabla_asig = self.generar_tabla_graficos_pastel(conteo_asig_por_programa)
        elementos.append(tabla_asig)
        #Cuenta a los estudiantes que quedaron en lista de espera por programa 
        conteo_lista_esp_por_programa = (
            lista_espera
            .values(codigo_programa=F('est_codigo__pro_codigo'),nombre_programa=F('est_codigo__pro_codigo__pro_nombre'))
            .annotate(total_estudiantes=Count('est_codigo', distinct=True))
            .order_by('nombre_programa')
        )

        grafico_pastel_esp = generar_grafico_pastel(conteo_lista_esp_por_programa,ancho=400,alto=300)
        elementos.append(grafico_pastel_esp)
        tabla_esp= self.generar_tabla_graficos_pastel(conteo_lista_esp_por_programa)
        elementos.append(tabla_esp)

        for pro in programas:
            nombre_programa = pro["pro_codigo_pro_nombre"]
            codigo_programa = pro["pro_codigo_pro_codigo"]
            elementos.append(self.agregar_subtitulo(nombre_programa,styles,"Heading2"))

            electivas = self.datos_oferta.filter(pro_codigo=codigo_programa)
            # Diccionario con la cantidad de estudiantes con cupos asignados
            # y cantidad de estudiantes en lista de espera por electiva
            cant_asig_esp = {}
            for ele in electivas:
                nombre_ele = ele.ele_codigo.ele_nombre
                ele_codigo = ele.ele_codigo.ele_codigo
                
                # Contar estudiantes asignados (en_lista_espera=False) para esta electiva y programa
                cant_asignados = self.datos_asignacion.filter(
                    ele_codigo=ele_codigo,
                    est_codigo__pro_codigo=codigo_programa,
                    en_lista_espera=False
                ).values('est_codigo').distinct().count()
                
                # Contar estudiantes en lista de espera (en_lista_espera=True) para esta electiva y programa
                cant_espera = self.datos_asignacion.filter(
                    ele_codigo=ele_codigo,
                    est_codigo__pro_codigo=codigo_programa,
                    en_lista_espera=True
                ).values('est_codigo').distinct().count()
                
                # Almacenar en el diccionario con formato: {nombre_electiva: {espera:##, asignados:##}}
                cant_asig_esp[ele_codigo] = {
                    "nombre":nombre_ele,
                    "espera": cant_espera,
                    "asignados": cant_asignados
                }
            grafica_electivas = generar_grafico_barras_acumuladas(cant_asig_esp,ancho=500,alto=300)
            elementos.append(grafica_electivas)
            tabla_electivas = self.generar_tabla_graficos_barras(cant_asig_esp)
            elementos.append(tabla_electivas)


        return elementos

    def generar_tabla_graficos_pastel(self, datos):
        encabezados = ["Código", "Programa", "Cant"]
        data = [encabezados]
        
        for registro in datos:

            data.append([
            registro["codigo_programa"],
            registro["nombre_programa"],
            registro["total_estudiantes"],
         ])
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
    
    def generar_tabla_graficos_barras(self, datos: dict):
        encabezados = ["Código", "Nombre electiva", "Asignados", "Espera"]
        data = [encabezados]
        
        for ele_codigo in datos.keys:
            data.append([
                        ele_codigo,
                        datos[ele_codigo].get("nombre"),
                        datos[ele_codigo].get("asignados"),
                        datos[ele_codigo].get("espera")
            ])
        
        tabla = Table(data, colWidths=[4 * cm, 9 * cm, 3 * cm,3 * cm])
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