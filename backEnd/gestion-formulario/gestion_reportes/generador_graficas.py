from reportlab.graphics.shapes import Drawing, String
from reportlab.graphics.charts.piecharts import Pie
from reportlab.lib import colors

from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.textlabels import Label


def generar_grafico_pastel(conteo_programas, ancho, alto):
    """
    Genera un gráfico de pastel (Pie Chart) a partir del resultado de conteo_programas.
    Retorna un objeto Drawing que puede añadirse a un PDF con platypus.
    
    conteo_programas = [
        {"nombre_programa": "Ingeniería de Sistemas", "total_estudiantes": 12},
        {"nombre_programa": "Administración", "total_estudiantes": 8},
        {"nombre_programa": "Contaduría", "total_estudiantes": 5}
    ]
    """
    # Extraer datos
    labels = [item["nombre_programa"] for item in conteo_programas]
    data = [item["total_estudiantes"] for item in conteo_programas]

    total = sum(data)
    if total == 0:
        total = 1  # evitar división por cero

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
            "Distribución de estudiantes por programa",
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
    bc.categoryAxis.categoryNames = programas
    bc.barLabelFormat = lambda x: ''  # Return empty string for all values
    # Estilo de las barras
    bc.barWidth = max(10, (bc.width / len(programas)) * 0.6)
    bc.groupSpacing = 10
    bc.bars[0].fillColor = colors.lightblue

    # Ejes
    bc.valueAxis.valueMin = 0
    bc.valueAxis.labels.fontSize = 8
    bc.categoryAxis.labels.angle = 45
    bc.categoryAxis.labels.fontSize = 8
    bc.categoryAxis.labels.dy = -20
    
    # Título
    title = Label()
    title.setOrigin(ancho / 2, alto - 20)
    title.boxAnchor = 'n'
    title.fontName = 'Helvetica-Bold'
    title.fontSize = 12
    title.text = nombre_grafico

    drawing.add(bc)
    drawing.add(title)
   
    return drawing