from reportlab.graphics.shapes import Drawing, String
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
    valores_asignados = [cant_asig_esp[ele]["asignados"] for ele in codigos_electivas]
    valores_espera = [cant_asig_esp[ele]["espera"] for ele in codigos_electivas]

    drawing = Drawing(ancho, alto)

    # Crear gráfico de barras
    bc = VerticalBarChart()
    bc.x = 50
    bc.y = 60
    bc.width = ancho - 100  # margen horizontal
    bc.height = alto - 120  # margen vertical
    
    # Datos: primera serie (asignados - base), segunda serie (espera - encima)
    bc.data = [valores_asignados, valores_espera]
    
    # IMPORTANTE: Habilitar barras acumuladas (stacked)
    bc.groupSpacing = 8
    bc.barWidth = max(10, (bc.width / len(codigos_electivas)) * 0.6)
    
    # Establecer que las barras sean acumuladas
    for bar_group in bc.bars:
        bar_group.strokeColor = None
    
    bc.bars[0].fillColor = colors.HexColor("#28C76F")  # Verde para asignados (base)
    bc.bars[1].fillColor = colors.HexColor("#FF9F43")  # Naranja para espera (encima)
    
    # Configurar para que sea stacked
    bc.style = 'stacked'
    
    # Eje Y (valores)
    bc.valueAxis.valueMin = 0
    bc.valueAxis.labels.fontSize = 10
    
    # Eje X (categorías)
    bc.categoryAxis.labels.angle = -45
    bc.categoryAxis.labels.fontSize = 9
    bc.categoryAxis.labels.dy = -10
    bc.categoryAxis.labels.boxAnchor = 'ne'
    
    drawing.add(bc)
    
    # Título del gráfico
    drawing.add(
        String(
            ancho / 2, alto - 20,
            "Distribución de Estudiantes por Electiva (Asignados vs Espera)",
            fontSize=12,
            textAnchor="middle"
        )
    )
    
    # Leyenda manual
    drawing.add(String(60, 40, "■ Asignados", fontSize=10, fillColor=colors.HexColor("#28C76F")))
    drawing.add(String(250, 40, "■ En Espera", fontSize=10, fillColor=colors.HexColor("#FF9F43")))

    return drawing