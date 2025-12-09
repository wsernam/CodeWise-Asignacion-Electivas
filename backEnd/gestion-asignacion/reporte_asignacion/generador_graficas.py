from reportlab.graphics.shapes import Drawing, String, Rect, Line
from reportlab.graphics.charts.piecharts import Pie
from reportlab.lib import colors

from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.textlabels import Label


def generar_grafico_pastel(titulo,conteo_programas, ancho, alto):
    """
    Genera un gráfico de pastel (Pie Chart) a partir del resultado de conteo_programas.
    Retorna un objeto Drawing que puede añadirse a un PDF con platypus.

    conteo_programas = [
        {"nombre_programa": "Ingeniería de Sistemas", "total_estudiantes": 12},
        {"nombre_programa": "Administración", "total_estudiantes": 8},
        {"nombre_programa": "Contaduría", "total_estudiantes": 5}
    ]
    """

    print("Datos pie:", conteo_programas, flush=True)

    # Verificar datos válidos
    
    # Extraer datos
    labels = [item["nombre_programa"] for item in conteo_programas]
    data = [item["total_estudiantes"] for item in conteo_programas]

    total = sum(data)
    if not data or sum(data) <= 0:
        drawing = Drawing(ancho, alto)
         # Título del gráfico
        drawing.add(
            String(
                250, 270,  # posición (x, y)
                titulo,
                fontSize=14,
                textAnchor="middle"
            )
        )
        drawing.add(String(150, 150, "No estudiantes sin electivas asignadas", fontSize=14))
        return drawing

    # Crear gráfico base
    pie = Pie()
    pie.data = data
    pie.labels = [f"{lbl}\n{val} ({val/total*100:.1f}%)" for lbl, val in zip(labels, data)]
    pie.sideLabels = True
    pie.slices.strokeWidth = 0.5

    # Colores personalizados (opcional)
    colores = [
        colors.HexColor("#6C63FF"),
        colors.HexColor("#FF6584"),
        colors.HexColor("#28C76F"),
        colors.HexColor("#00CFE8"),
        colors.HexColor("#FF9F43"),
        colors.HexColor("#EA5455"),
    ]
    for i, color in enumerate(colores):
        if i < len(pie.data):
            pie.slices[i].fillColor = color

    # Ajustes de tamaño
    pie.width = 200
    pie.height = 200
    pie.x = 150
    pie.y = 50

    # Crear contenedor Drawing para poder agregar al PDF
    drawing = Drawing(ancho, alto)
    drawing.add(pie)

    # Título del gráfico
    drawing.add(
        String(
            250, 270,  # posición (x, y)
            titulo,
            fontSize=14,
            textAnchor="middle"
        )
    )

    return drawing


def generar_grafico_barras(nombre_grafico, datos, ancho=420, alto=280):
    """
    Genera un gráfico de barras vertical compatible con ReportLab Platypus.
    
    Parámetros:
        nombre_grafico (str): Título del gráfico.
        datos (list[dict]): Lista de diccionarios con las claves:
                            - 'programa': nombre del programa
                            - 'total_estudiantes': cantidad de estudiantes
        ancho (int): ancho total del gráfico (Drawing)
        alto (int): alto total del gráfico (Drawing)

    Retorna:
        Drawing: objeto gráfico compatible con Platypus
    """
    if not datos:
        return Drawing(ancho, alto)

    programas = [d['cod_programa'] for d in datos]
    valores = [d['total_estudiantes'] for d in datos]

    drawing = Drawing(ancho, alto)

    bc = VerticalBarChart()
    bc.x = 50
    bc.y = 60
    bc.width = ancho - 100      # margen horizontal
    bc.height = alto - 120      # margen vertical
    bc.data = [valores]
   

    # Estilo de las barras
    bc.barWidth = max(10, (bc.width / len(programas)) * 0.6)
    bc.groupSpacing = 10
    bc.bars[0].fillColor = colors.lightblue

    # Ejes
    bc.valueAxis.valueMin = 0
    bc.valueAxis.labels.fontSize = 12
    bc.categoryAxis.labels.angle = 0
    bc.categoryAxis.labels.fontSize = 8
    bc.categoryAxis.labels.dy = -10
    bc.categoryAxis.labels.boxAnchor = 'ne'
    bc.categoryAxis.categoryNames = programas
    
    drawing.add(bc)
   
    return drawing


def generar_grafico_barras_acumuladas(cant_asig_esp, ancho=500, alto=350):
    """
    Genera un gráfico de barras acumuladas (stacked bar chart).
    La barra de estudiantes en lista de espera aparece encima de la barra de asignados.

    Parámetros:
        cant_asig_esp (dict): Diccionario con estructura:
                              {
                                  "ELE-101": {"asignados": 20, "espera": 5},
                                  "ELE-102": {"asignados": 18, "espera": 3},
                                  ...
                              }
        ancho (int): ancho total del gráfico (Drawing)
        alto (int): alto total del gráfico (Drawing)

    Retorna:
        Drawing: objeto gráfico de barras acumuladas compatible con Platypus
    """
    if not cant_asig_esp:
        return Drawing(ancho, alto)

    # Extraer códigos de electivas y separar datos
    codigos_electivas = list(cant_asig_esp.keys())
    
    # Calcular totales y valores máximos para escala
    datos_barras = []
    max_total = 0
    
    for ele in codigos_electivas:
        asignados = cant_asig_esp[ele]["asignados"]
        espera = cant_asig_esp[ele]["espera"]
        total = asignados + espera
        datos_barras.append({
            'ele_codigo': ele,
            'asignados': asignados,
            'espera': espera,
            'total': total
        })
        max_total = max(max_total, total)

    # Configurar escala
    if max_total == 0:
        max_total = 1
    
    drawing = Drawing(ancho, alto)
    
    # Parámetros de posición y tamaño
    margin_left = 50
    margin_bottom = 60
    margin_top = 80
    margin_right = 20
    
    chart_width = ancho - margin_left - margin_right
    chart_height = alto - margin_top - margin_bottom
    
    # Ancho de cada barra
    num_barras = len(codigos_electivas)
    espaciado_barras = chart_width / (num_barras + 1)
    ancho_barra = espaciado_barras * 0.6
    
    # Escala Y (altura de barra = valor / max_total * chart_height)
    def scale_value(valor):
        return (valor / max_total) * chart_height if max_total > 0 else 0
    
    # Dibujar barras acumuladas
    for i, datos in enumerate(datos_barras):
        x_pos = margin_left + (i + 1) * espaciado_barras - ancho_barra / 2
        y_base = margin_bottom
        
        # Barra de asignados (base - azul)
        altura_asignados = scale_value(datos['asignados'])
        rect_asignados = Rect(
            x_pos, y_base,
            ancho_barra, altura_asignados,
            fillColor=colors.HexColor("#587CFF"),
            strokeColor=colors.black,
            strokeWidth=0.5
        )
        drawing.add(rect_asignados)
        
        # Barra de espera (encima - rojo)
        y_espera = y_base + altura_asignados
        altura_espera = scale_value(datos['espera'])
        rect_espera = Rect(
            x_pos, y_espera,
            ancho_barra, altura_espera,
            fillColor=colors.HexColor("#ED6B6D"),
            strokeColor=colors.black,
            strokeWidth=0.5
        )
        drawing.add(rect_espera)
        
        # Etiqueta en X (código de electiva)
        label_x = String(
            x_pos + ancho_barra / 2,
            margin_bottom - 25,
            datos['ele_codigo'],
            fontSize=8,
            textAnchor='middle',
            angle=-45
        )
        drawing.add(label_x)
        
        # Valor total encima de la barra
        valor_total = String(
            x_pos + ancho_barra / 2,
            y_espera + altura_espera + 5,
            str(datos['total']),
            fontSize=9,
            textAnchor='middle',
            fontName='Helvetica-Bold'
        )
        drawing.add(valor_total)
    
    # Línea de base (eje X)
    from reportlab.graphics.shapes import Line
    line_base = Line(
        margin_left, margin_bottom,
        margin_left + chart_width, margin_bottom,
        strokeColor=colors.black,
        strokeWidth=1
    )
    drawing.add(line_base)
    
    # Eje Y
    line_y = Line(
        margin_left, margin_bottom,
        margin_left, margin_bottom + chart_height,
        strokeColor=colors.black,
        strokeWidth=1
    )
    drawing.add(line_y)
    
    # Etiquetas del eje Y (valores)
    num_marcas = 5
    for i in range(num_marcas + 1):
        valor = int((i / num_marcas) * max_total)
        y_pos = margin_bottom + (i / num_marcas) * chart_height
        
        # Marca pequeña en el eje
        marca = Line(
            margin_left - 5, y_pos,
            margin_left, y_pos,
            strokeColor=colors.black,
            strokeWidth=0.5
        )
        drawing.add(marca)
        
        # Etiqueta numérica
        label_y = String(
            margin_left - 15, y_pos - 3,
            str(valor),
            fontSize=8,
            textAnchor='end'
        )
        drawing.add(label_y)
    
    # Título del gráfico
    titulo = String(
        ancho / 2, alto - 20,
        "Distribución de Estudiantes por Electiva (Asignados vs Espera)",
        fontSize=12,
        textAnchor="middle",
        fontName='Helvetica-Bold'
    )
    drawing.add(titulo)
    
    # Leyenda
    legend_y = 20
    legend_x_label = 315
    legend_x_rect = 300
    # Rectángulo leyenda asignados
    rect_legend_asig = Rect(
        legend_x_rect - 140, legend_y - 3,
        10, 10,
        fillColor=colors.HexColor("#587CFF"),
        strokeColor=colors.black,
        strokeWidth=0.5
    )
    drawing.add(rect_legend_asig)
    
    label_asig = String(
        legend_x_label -140, legend_y,
        "Asignados",
        fontSize=9
    )
    drawing.add(label_asig)
    
    # Rectángulo leyenda espera
    rect_legend_esp = Rect(
        legend_x_rect, legend_y - 3,
        10, 10,
        fillColor=colors.HexColor("#ED6B6D"),
        strokeColor=colors.black,
        strokeWidth=0.5
    )
    drawing.add(rect_legend_esp)
    
    label_esp = String(
        legend_x_label, legend_y,
        "En Espera",
        fontSize=9
    )
    drawing.add(label_esp)
    
    return drawing