from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from collections import defaultdict

from asignacion.models import Asignacion
from .generador_pdf import crear_pdf

# --- Elementos para ReportLab ---
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors

class ReporteAsignacionPDFView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Consultar y agrupar los datos
        asignaciones = Asignacion.objects.filter(
            anio=anio, asi_num_semestre=semestre
        ).select_related('ele_codigo', 'est_codigo').order_by(
            'ele_codigo__ele_nombre', 'en_lista_espera', 'est_codigo__est_apellido'
        )

        if not asignaciones.exists():
            return Response(
                {"detail": f"No hay reportes disponibles para el período {anio}-{semestre}."},
                status=status.HTTP_404_NOT_FOUND
            )

        reporte_data = defaultdict(lambda: {"asignados": [], "espera": []})
        for a in asignaciones:
            nombres_apellidos = f"{a.est_codigo.est_apellido} {a.est_codigo.est_nombre}"
            if a.en_lista_espera:
                reporte_data[a.ele_codigo.ele_nombre]["espera"].append((a.est_codigo_id, nombres_apellidos))
            else:
                reporte_data[a.ele_codigo.ele_nombre]["asignados"].append((a.est_codigo_id, nombres_apellidos))

        # 2. Construir los elementos para el PDF con ReportLab
        styles = getSampleStyleSheet()
        elementos = []

        # --- Estilos con letra más grande ---
        estilo_h2 = ParagraphStyle(name='h2_grande', parent=styles['h2'], fontSize=16)
        estilo_normal = ParagraphStyle(name='normal_grande', parent=styles['Normal'], fontSize=11)
        estilo_italic = ParagraphStyle(name='italic_grande', parent=styles['Italic'], fontSize=11)
        
        # Estilo para los títulos centrados
        estilo_titulo_centrado = ParagraphStyle(
            name='h3_centered',
            parent=styles['h3'],
            alignment=TA_CENTER,
            fontSize=14
        )

        # Estilo para la tabla de asignados (verde)
        estilo_tabla_asignados = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#38761d")), # Verde oscuro
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12), # Tamaño letra encabezado
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 11), # Tamaño letra contenido
        ])
        
        # Estilo para la tabla de espera (azul)
        estilo_tabla_espera = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4F81BD")), # Azul
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12), # Tamaño letra encabezado
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 11), # Tamaño letra contenido
        ])

        for electiva, data in reporte_data.items():
            elementos.append(Paragraph(f"<b>Electiva:</b> {electiva}", estilo_h2))
            elementos.append(Paragraph("<b>Estudiantes Asignados con Cupo</b>", estilo_titulo_centrado))

            # Tabla para estudiantes asignados
            if data['asignados']:
                tabla_asignados_data = [["#", "Código", "Nombres y Apellidos"]]
                for i, (codigo, nombres) in enumerate(data['asignados'], 1):
                    tabla_asignados_data.append([str(i), str(codigo), nombres])
                
                tabla_asignados = Table(
                    tabla_asignados_data, 
                    colWidths=[1.5*cm, 3*cm, None],
                    # Ajustamos el espaciado entre filas para que no se vea apretado
                    rowHeights=len(tabla_asignados_data) * [0.8*cm] 
                )
                tabla_asignados.setStyle(estilo_tabla_asignados)
                elementos.append(tabla_asignados)
            else:
                elementos.append(Paragraph("<i>No hay estudiantes asignados con cupo.</i>", estilo_italic))

            elementos.append(Spacer(1, 0.5 * cm))
            elementos.append(Paragraph("<b>Estudiantes en Lista de Espera</b>", estilo_titulo_centrado))

            # Tabla para lista de espera
            if data['espera']:
                tabla_espera_data = [["#", "Código", "Nombres y Apellidos"]]
                for i, (codigo, nombres) in enumerate(data['espera'], 1):
                    tabla_espera_data.append([str(i), str(codigo), nombres])
                
                tabla_espera = Table(
                    tabla_espera_data, 
                    colWidths=[1.5*cm, 3*cm, None],
                    rowHeights=len(tabla_espera_data) * [0.8*cm]
                )
                tabla_espera.setStyle(estilo_tabla_espera)
                elementos.append(tabla_espera)
            else:
                elementos.append(Paragraph("<i>No hay estudiantes en lista de espera.</i>", estilo_italic))

            elementos.append(Spacer(1, 1 * cm))

        # 3. Generar el PDF
        nombre_informe = f"Reporte de Asignación {anio}-{semestre}"
        pdf_data = crear_pdf(nombre_informe, elementos)

        # 4. Devolver el PDF en la respuesta
        response = HttpResponse(pdf_data, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{nombre_informe.replace(" ", "_")}.pdf"'
        return response

class ReporteElectivaPDFView(APIView):
    def get(self, request, ele_codigo, *args, **kwargs):
        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Consultar y agrupar los datos para UNA electiva
        asignaciones = Asignacion.objects.filter(
            anio=anio, 
            asi_num_semestre=semestre,
            ele_codigo__ele_codigo=ele_codigo
        ).select_related('ele_codigo', 'est_codigo').order_by(
            'en_lista_espera', 'est_codigo__est_apellido'
        )

        if not asignaciones.exists():
            return Response(
                {"detail": f"No se encontraron reportes para la electiva {ele_codigo} en el período {anio}-{semestre}."},
                status=status.HTTP_404_NOT_FOUND
            )

        asignados_data = []
        espera_data = []
        nombre_electiva = asignaciones.first().ele_codigo.ele_nombre

        for a in asignaciones:
            nombres_apellidos = f"{a.est_codigo.est_apellido} {a.est_codigo.est_nombre}"
            if a.en_lista_espera:
                espera_data.append((a.est_codigo_id, nombres_apellidos))
            else:
                asignados_data.append((a.est_codigo_id, nombres_apellidos))

        # 2. Construir los elementos para el PDF con ReportLab
        styles = getSampleStyleSheet()
        elementos = []

        # --- Estilos con letra más grande ---
        estilo_h2 = ParagraphStyle(name='h2_grande', parent=styles['h2'], fontSize=16)
        estilo_italic = ParagraphStyle(name='italic_grande', parent=styles['Italic'], fontSize=11)
        
        estilo_titulo_centrado = ParagraphStyle(
            name='h3_centered', parent=styles['h3'], alignment=TA_CENTER, fontSize=14
        )

        estilo_tabla_asignados = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#38761d")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
        ])
        
        estilo_tabla_espera = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4F81BD")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
        ])

        elementos.append(Paragraph(f"<b>Electiva:</b> {nombre_electiva}", estilo_h2))
        elementos.append(Paragraph("<b>Estudiantes Asignados con Cupo</b>", estilo_titulo_centrado))

        if asignados_data:
            tabla_data = [["#", "Código", "Nombres y Apellidos"]]
            for i, (codigo, nombres) in enumerate(asignados_data, 1):
                tabla_data.append([str(i), str(codigo), nombres])
            
            tabla = Table(tabla_data, colWidths=[1.5*cm, 3*cm, None], rowHeights=len(tabla_data) * [0.8*cm])
            tabla.setStyle(estilo_tabla_asignados)
            elementos.append(tabla)
        else:
            elementos.append(Paragraph("<i>No hay estudiantes asignados con cupo.</i>", estilo_italic))

        elementos.append(Spacer(1, 0.5 * cm))
        elementos.append(Paragraph("<b>Estudiantes en Lista de Espera</b>", estilo_titulo_centrado))

        if espera_data:
            tabla_data = [["#", "Código", "Nombres y Apellidos"]]
            for i, (codigo, nombres) in enumerate(espera_data, 1):
                tabla_data.append([str(i), str(codigo), nombres])
            
            tabla = Table(tabla_data, colWidths=[1.5*cm, 3*cm, None], rowHeights=len(tabla_data) * [0.8*cm])
            tabla.setStyle(estilo_tabla_espera)
            elementos.append(tabla)
        else:
            elementos.append(Paragraph("<i>No hay estudiantes en lista de espera.</i>", estilo_italic))

        elementos.append(Spacer(1, 1 * cm))

        # 3. Generar el PDF
        nombre_informe = f"Reporte_{nombre_electiva.replace(' ', '_')}_{anio}-{semestre}"
        pdf_data = crear_pdf(nombre_informe, elementos)

        # 4. Devolver el PDF en la respuesta
        response = HttpResponse(pdf_data, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{nombre_informe}.pdf"'
        return response
