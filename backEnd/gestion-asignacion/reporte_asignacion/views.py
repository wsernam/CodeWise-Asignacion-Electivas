from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from collections import defaultdict
from referencias.models import Estudiante, Electiva, SeleccionEstudianteElectiva as Sel  
from asignacion.models import Asignacion
from gestion_hojas_de_calculo.models import PerfilAcademico
from referencias.models import Oferta
from reporte_asignacion.generador_contenido_reporte_general import GenerardorContenidoReporteGeneral
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
        
         # 2) Verificar que la electiva exista (y opcional: que esté activa)
        electiva = Electiva.objects.filter(ele_codigo=ele_codigo).first()
        if not electiva:
            return Response(
                {"detail": f"La electiva {ele_codigo} no existe o está inactiva."},
                status=status.HTTP_404_NOT_FOUND,
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

class ReporteEstudiantePDFView(APIView):
    """
    Reporte PDF por estudiante para un período (anio, semestre).
    """

    def get(self, request, est_id, *args, **kwargs):
        # --- 1) Parámetros requeridos ---
        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- 2) Flag para usar payload externo ---
        usar_payload = request.query_params.get("usar_payload") == "true"
        payload = None

        if usar_payload:
            # Si viene payload, lo usamos (como ya lo tenías)
            try:
                payload = request.data
                if isinstance(payload, list) and payload:
                    payload = payload[0]
            except Exception:
                payload = None
            # En este caso NO obligamos a que exista el Estudiante en la BD;
            # el payload manda la información.
            estudiante = None
        else:
            # 🔹 NUEVO: validar que el estudiante exista en la BD
            estudiante = Estudiante.objects.filter(pk=est_id).first()
            if not estudiante:
                return Response(
                    {
                        "detail": (
                            f"No se encontró ningún estudiante con código "
                            f"{est_id}."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        # --- 3) Carga de datos desde Asignacion para el período ---
        asignaciones_qs = (
            Asignacion.objects
            .filter(
                anio=anio,
                asi_num_semestre=semestre,
                est_codigo_id=est_id,
            )
            .select_related("ele_codigo", "est_codigo")
        )

        asignadas_firmes = []
        asignadas_espera = []

        for a in asignaciones_qs:
            # si hay asignaciones, garantizamos estudiante aquí también
            estudiante = estudiante or a.est_codigo
            fila = {
                "ele_codigo": a.ele_codigo.ele_codigo,
                "ele_nombre": a.ele_codigo.ele_nombre,
            }
            if a.en_lista_espera:
                asignadas_espera.append(fila)
            else:
                asignadas_firmes.append(fila)

        # --- 4) Procesar payload (si viene) ---
        est_header = {}
        selecciones = []

        if payload:
            est_header = {
                "est_id": payload.get("est_id", est_id),
                "nombres": payload.get("nombres") or "",
                "apellidos": payload.get("apellidos") or "",
                "programa": payload.get("programa") or "",
                "programa_nombre": payload.get("programa_nombre") or "",
                "porcentaje_avance": payload.get("porcentaje_avance"),
                "promedio": payload.get("promedio"),
                "nivelado": payload.get("nivelado"),
                "creditos_aprob_total": payload.get("creditos_aprob_total"),
                "num_periodos_matriculados": payload.get("num_periodos_matriculados"),
                "electivas_debe_ver": payload.get("electivas_debe_ver"),
                "num_electivas_cursadas": payload.get("num_electivas_cursadas"),
                "electivas_faltantes": payload.get("electivas_faltantes"),
            }
            selecciones = payload.get("selecciones") or []
            asignadas_firmes = payload.get("asignadas_firmes") or asignadas_firmes
            asignadas_espera = payload.get("asignadas_espera") or asignadas_espera
        else:
            # Sin payload: armar cabecera con lo que tengamos de la BD
            est_header = {
                "est_id": est_id,
                "nombres": getattr(estudiante, "est_nombre", "") or "",
                "apellidos": getattr(estudiante, "est_apellido", "") or "",
                "programa": getattr(
                    getattr(estudiante, "pro_codigo", None), "pro_codigo", ""
                ) or "",
                "programa_nombre": getattr(
                    getattr(estudiante, "pro_codigo", None), "pro_nombre", ""
                ) or "",
            }

        # --- 5) Si NO hay asignaciones y NO hay payload/selecciones -> 404 ---
        if not asignadas_firmes and not asignadas_espera and not selecciones:
            return Response(
                {
                    "detail": (
                        f"No se encontraron asignaciones ni listas de espera "
                        f"para el estudiante {est_id} en el período {anio}-{semestre}."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --- 6) Construcción del PDF (misma lógica que tenías antes) ---
        styles = getSampleStyleSheet()
        estilo_h2 = ParagraphStyle(name='h2_grande', parent=styles['h2'], fontSize=16)
        estilo_h3_center = ParagraphStyle(
            name='h3_center', parent=styles['h3'], alignment=TA_CENTER, fontSize=14
        )
        estilo_norm = ParagraphStyle(name='norm', parent=styles['Normal'], fontSize=11)
        estilo_italic = ParagraphStyle(name='italic', parent=styles['Italic'], fontSize=11)
        estilo_italic_center = ParagraphStyle(
            name='italic_center',
            parent=styles['Italic'],
            fontSize=11,
            alignment=TA_CENTER
        )

        estilo_tabla_verde = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#38761d")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
        ])
        estilo_tabla_azul = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4F81BD")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
        ])

        elementos = []

        # Título
        elementos.append(Paragraph("<b>Reporte de Electivas – Estudiante</b>", estilo_h2))
        elementos.append(Spacer(1, 0.2 * cm))
        elementos.append(Paragraph(f"<b>Período:</b> {anio}-{semestre}", estilo_norm))
        elementos.append(Spacer(1, 0.2 * cm))

        # Ficha del estudiante
        nom = f"{est_header.get('apellidos','')} {est_header.get('nombres','')}".strip()
        prog = est_header.get("programa_nombre") or est_header.get("programa") or ""
        elementos.append(Paragraph(
            f"<b>Estudiante:</b> {nom} <br/>"
            f"<b>Código:</b> {est_header.get('est_id')} <br/>"
            f"<b>Programa:</b> {prog}",
            estilo_norm,
        ))

        # Métricas (si hay)
        def _fmt(v, suf=""):
            return f"{v}{suf}" if v is not None else "—"

        if any(
            k in est_header
            for k in (
                "porcentaje_avance", "promedio", "nivelado",
                "electivas_debe_ver", "num_electivas_cursadas",
                "electivas_faltantes", "creditos_aprob_total",
                "num_periodos_matriculados",
            )
        ):
            elementos.append(Spacer(1, 0.2 * cm))
            metas = [
                ["Porcentaje avance", _fmt(est_header.get("porcentaje_avance"), "%")],
                ["Promedio", _fmt(est_header.get("promedio"))],
                ["Nivelado", "Sí" if est_header.get("nivelado") else (
                    "No" if est_header.get("nivelado") is not None else "—"
                )],
                ["Créditos aprob. (totales)", _fmt(est_header.get("creditos_aprob_total"))],
                ["Períodos matriculados", _fmt(est_header.get("num_periodos_matriculados"))],
                ["Electivas que debe ver", _fmt(est_header.get("electivas_debe_ver"))],
                ["Electivas cursadas", _fmt(est_header.get("num_electivas_cursadas"))],
                ["Electivas faltantes", _fmt(est_header.get("electivas_faltantes"))],
            ]
            t_meta = Table([["Indicador", "Valor"], *metas], colWidths=[7*cm, None])
            t_meta.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
            ]))
            elementos.append(t_meta)

        elementos.append(Spacer(1, 0.5 * cm))

        # Tabla: Asignadas con cupo
        elementos.append(Paragraph("<b>Electivas Asignadas con Cupo</b>", estilo_h3_center))
        if asignadas_firmes:
            data = [["#", "Código", "Electiva"]]
            for i, e in enumerate(asignadas_firmes, 1):
                data.append([str(i), e["ele_codigo"], e["ele_nombre"]])
            t = Table(data, colWidths=[1.5*cm, 3*cm, None], rowHeights=len(data) * [0.8*cm])
            t.setStyle(estilo_tabla_verde)
            elementos.append(t)
        else:
            elementos.append(
                Paragraph("<i>No tiene electivas asignadas con cupo.</i>", estilo_italic_center)
            )

        elementos.append(Spacer(1, 0.5 * cm))

        # Tabla: Lista de espera
        elementos.append(Paragraph("<b>Electivas en Lista de Espera</b>", estilo_h3_center))
        if asignadas_espera:
            data = [["#", "Código", "Electiva"]]
            for i, e in enumerate(asignadas_espera, 1):
                data.append([str(i), e["ele_codigo"], e["ele_nombre"]])
            t = Table(data, colWidths=[1.5*cm, 3*cm, None], rowHeights=len(data) * [0.8*cm])
            t.setStyle(estilo_tabla_azul)
            elementos.append(t)
        else:
            elementos.append(
                Paragraph("<i>No tiene electivas en lista de espera.</i>", estilo_italic_center)
            )

        # Tabla: Selecciones (si el payload las trae)
        if selecciones:
            elementos.append(Spacer(1, 0.5 * cm))
            elementos.append(Paragraph("<b>Selecciones del Estudiante</b>", estilo_h3_center))
            data = [["Prioridad", "Código", "Electiva"]]
            for s in selecciones:
                data.append([
                    str(s.get("prioridad")),
                    s.get("ele_codigo", ""),
                    s.get("ele_nombre", ""),
                ])
            t = Table(data, colWidths=[2.5*cm, 3*cm, None], rowHeights=len(data) * [0.8*cm])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 11),
            ]))
            elementos.append(t)

        elementos.append(Spacer(1, 1 * cm))

        # --- Generar PDF ---
        nombre_informe = f"Reporte_estudiante_{est_id}_{anio}-{semestre}"
        pdf_data = crear_pdf(nombre_informe, elementos)

        response = HttpResponse(pdf_data, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="{nombre_informe}.pdf"'
        )
        return response


class ReporteLotesSeleccionesPDFView(APIView):
    """
    Genera un PDF con LOTES de códigos de estudiantes que hicieron selección
    de electivas en un período dado.
    - Usa solo SeleccionEstudianteElectiva (Sel).
    - Filtra por sel_anio, sel_num_semestre.
    - Param opcional: lote_size (tamaño de cada lote, por defecto 100).
    """

    def get(self, request, *args, **kwargs):
        # 1) Parámetros requeridos
        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # lote_size opcional
        try:
            lote_size = int(request.query_params.get("lote_size", 100))
            if lote_size <= 0:
                raise ValueError
        except ValueError:
            return Response(
                {"detail": "lote_size debe ser un entero positivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2) Query: SOLO selecciones por periodo (sin electiva)
        qs = Sel.objects.filter(sel_anio=anio, sel_num_semestre=semestre)

        codigos = list(
            qs.values_list("est_codigo_id", flat=True)
              .distinct()
              .order_by("est_codigo_id")
        )
        total = len(codigos)

        # 3) Armar LOTES
        lotes = []
        if total:
            for i in range(0, total, lote_size):
                lotes.append(codigos[i:i + lote_size])

        # 4) Construir PDF con ReportLab + crear_pdf
        styles = getSampleStyleSheet()
        h2 = ParagraphStyle(name='h2_center', parent=styles['Heading2'],
                            alignment=TA_CENTER, fontSize=16)
        h3 = ParagraphStyle(name='h3_center', parent=styles['Heading3'],
                            alignment=TA_CENTER, fontSize=13)
        normal = styles['Normal']

        elementos = []

        titulo = "Lotes de Códigos – Selecciones de Electivas"
        subt = f"Período: {anio}-{semestre} | Total estudiantes: {total}"
        elementos.append(Paragraph(titulo, h2))
        elementos.append(Paragraph(subt, normal))
        elementos.append(Spacer(1, 0.5 * cm))

        if not lotes:
            elementos.append(
                Paragraph("<i>No hay estudiantes con selección en el período dado.</i>", normal)
            )
        else:
            base_style = TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4F81BD")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ])

            for idx_lote, lote in enumerate(lotes, start=1):
                elementos.append(Paragraph(f"Lote {idx_lote}", h3))
                data = [["#", "Código de Estudiante"]]
                for i, cod in enumerate(lote, start=1):
                    data.append([str(i), str(cod)])
                tabla = Table(data, colWidths=[2.2 * cm, 10 * cm])
                tabla.setStyle(base_style)
                elementos.append(tabla)
                elementos.append(Spacer(1, 0.4 * cm))

        nombre_pdf = f"lotes_selecciones_{anio}-{semestre}"
        pdf_bytes = crear_pdf(nombre_pdf, elementos)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{nombre_pdf}.pdf"'
        return response
    

class ReporteGeneralAsignacion(APIView):
    generador_contenido: GenerardorContenidoReporteGeneral
    nombre_informe = "Reporte general proceso de asignacion de electivas"
    def get(self, request, *args, **kwargs):
        # 1) Parámetros requeridos
        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Consultar estudiantes a los que se le asignaron electivas o quedaron en lista de espera
        asignaciones_qs = Asignacion.objects.filter(
            anio=anio,
            asi_num_semestre=semestre
        )
        queryset_oferta = Oferta.objects.filter(
            ofe_anio = anio,
            ofe_num_semestre = semestre
        )
        if not queryset_oferta.exists():
             return Response(
                {"detail": f"No se encontraron ofertas para el periodo {anio}-{semestre}."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not asignaciones_qs.exists():
             return Response(
                {"detail": f"No se encontraron asinaciones para el periodo {anio}-{semestre}."},
                status=status.HTTP_404_NOT_FOUND,
            )
        # Consultar los estudiantes con porcentaje de avance igual o superior al 65%
        queryset_perfil = PerfilAcademico.objects.filter(
            perfil_anio=anio,
            perfil_semestre=semestre,
            porcentaje_avance__gte=65
        )

        # Obtener los estudiantes que cumplen el umbral de avance pero NO tienen electivas asignadas o estan en lista de espera

        # Primero obtenemos los ids de estudiante que sí tienen asignación.
        ids_estudiantes_con_asignacion = asignaciones_qs.values_list('est_codigo__est_codigo',flat=True)

        # Luego excluimos esos estudiantes
        perfiles_sin_asignacion = queryset_perfil.exclude(est_codigo__in=ids_estudiantes_con_asignacion)

        self.generador_contenido = GenerardorContenidoReporteGeneral(datos_asignacion=asignaciones_qs, datos_estudiantes_sin_electiva=perfiles_sin_asignacion,
        datos_oferta=queryset_oferta)

        elementos = self.generador_contenido.generar_contenido()
        pdf_data = crear_pdf(self.nombre_informe,elementos)
        nombre_archivo = f"R_asignacion_General__{anio}_{semestre}.pdf"
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{nombre_archivo}.pdf"'
        response.write(pdf_data)
        return response

class LotesCodigosSeleccionesView(APIView):
    """
    Endpoint que retorna LOTES de códigos de estudiantes que realizaron
    selección de electivas en un período dado.
    - Solo filtra por sel_anio y sel_num_semestre.
    - Param opcional: lote_size (tamaño de cada lote, default=100).
    """

    def get(self, request, *args, **kwargs):
        # 1) Parámetros
        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            lote_size = int(request.query_params.get("lote_size", 100))
            if lote_size <= 0:
                raise ValueError
        except ValueError:
            return Response(
                {"detail": "lote_size debe ser un entero positivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2) Solo SELECCIONES por periodo (sin filtrar por electiva)
        qs = Sel.objects.filter(sel_anio=anio, sel_num_semestre=semestre)

        codigos = list(
            qs.values_list("est_codigo_id", flat=True)
              .distinct()
              .order_by("est_codigo_id")
        )

        total = len(codigos)

        # 3) Armar LOTES
        lotes = []
        if total:
            for i in range(0, total, lote_size):
                lotes.append(codigos[i:i + lote_size])

        # 4) Respuesta JSON (sin ele_codigo)
        data = {
            "anio": anio,
            "semestre": semestre,
            "total_estudiantes": total,
            "lote_size": lote_size,
            "num_lotes": len(lotes),
            "lotes": lotes,
        }
        return Response(data, status=status.HTTP_200_OK)
        



        

        
    
   


