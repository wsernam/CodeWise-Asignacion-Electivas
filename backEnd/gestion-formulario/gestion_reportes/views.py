from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from seleccion_electivas.models import SeleccionEstudianteElectiva
from gestion_estudiantes.models import Estudiante
from .serializers import ReporteSeleccionElectivasSerializer, ReporteOfertaElectivasSerializer
from .generador_contenido import GeneradorContenidoReporteSeleccion, GenerardorContenidoReporteOferta
from .generador_pdf import crear_pdf
from seleccion_electivas.serializers import ConsultaElectivaEstudianteDTO
from gestion_oferta_electiva.models import Oferta_electiva
from collections import defaultdict
from gestion_electivas.serializers import ElectivaSerializer
import logging

logger = logging.getLogger(__name__)

class ReporteSeleccionElectivasEstudianteViewSet(viewsets.ViewSet):
    """
    ViewSet para generar reportes de selección de electivas por estudiante.
    """
    serializer_class = ReporteSeleccionElectivasSerializer
    generador_contenido: GeneradorContenidoReporteSeleccion
    nombre_informe = "Reporte de Selección de Electivas"
    @action(
        detail=False,
        methods=["get"],
        url_path=r"(?P<est_codigo>\d+)/(?P<sel_anio>\d+)/(?P<sel_num_semestre>\d+)"
    )
    def electivas_por_estudiante(self, request, est_codigo=None, sel_anio=None, sel_num_semestre=None):
        """
        Obtiene todas las electivas seleccionadas por un estudiante 
        en un año y semestre específicos.
        URL de ejemplo:
        GET /reporte-seleccion/<est_codigo>/<anio>/<semestre>/
        """
        queryset = SeleccionEstudianteElectiva.objects.filter(
            est_codigo=est_codigo,
            sel_anio=sel_anio,
            sel_num_semestre=sel_num_semestre
        ).select_related('ele_codigo').order_by('sel_prioridad')

        if not queryset.exists():
            return Response(
                {"detail": f"No se encontro las selecciones para el estudiante {est_codigo} en el año {sel_anio} y semestre {sel_num_semestre}."},
                status=status.HTTP_404_NOT_FOUND,
            )
        datos_seleccion = ConsultaElectivaEstudianteDTO(queryset, many=True).data
        reporte_data =  ReporteSeleccionElectivasSerializer(queryset.first(), context={'electivas': datos_seleccion})
       
        self.generador_contenido = GeneradorContenidoReporteSeleccion(reporte_data)
        nombre_archivo = f"R_seleccion_{est_codigo}_{sel_anio}_{sel_num_semestre}.pdf"
        elementos = self.generador_contenido.generar_contenido()
        pdf_data = crear_pdf(self.nombre_informe,elementos)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{nombre_archivo}.pdf"'
        response.write(pdf_data)
        return response

class ReporteOfertaElectivasViewSet(viewsets.ViewSet):
    serializer_class = ReporteSeleccionElectivasSerializer
    generador_contenido: GeneradorContenidoReporteSeleccion
    nombre_informe = "Reporte de Oferta electivas"
    @action(
        detail=False,
        methods=["get"],
        url_path=r"(?P<ofe_anio>\d+)/(?P<ofe_num_semestre>\d+)"
    )
    def reporte_oferta_electivas(self, request, ofe_anio=None, ofe_num_semestre=None):
        
        queryset = Oferta_electiva.objects.filter(
            ofe_anio=ofe_anio,
            ofe_num_semestre=ofe_num_semestre
        ).select_related('ele_codigo','pro_codigo')
        logger.debug(queryset)
        electivas_programas = defaultdict(list)
        logger.debug(electivas_programas)
        for oferta in queryset:
            programa = oferta.pro_codigo
            electiva = oferta.ele_codigo
            electivas_programas[programa].append(electiva)
        logger.debug(queryset)
        logger.debug(electivas_programas)
        data = []
        for programa, electivas in electivas_programas.items():
            logger.debug(f"Programa: {programa} ({type(programa)})")
            data.append({
                "pro_codigo": programa.pro_codigo,
                "pro_nombre": programa.pro_nombre,
                "electivas": ElectivaSerializer(electivas, many=True).data
            })
        logger.debug(data)
        reporte_data = ReporteOfertaElectivasSerializer(data={
        "ofe_anio": queryset.first().ofe_anio,
        "ofe_num_semestre": queryset.first().ofe_num_semestre,
        "ofertas_programas": data
        })
        reporte_data.is_valid()
        print(reporte_data)
        self.generador_contenido = GenerardorContenidoReporteOferta(reporte_data)
        nombre_archivo = f"R_oferta_{ofe_anio}_{ofe_num_semestre}.pdf"
        elementos = self.generador_contenido.generar_contenido()
        pdf_data = crear_pdf(self.nombre_informe,elementos)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{nombre_archivo}.pdf"'
        response.write(pdf_data)
        return response







