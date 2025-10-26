from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from seleccion_electivas.models import SeleccionEstudianteElectiva
from gestion_estudiantes.models import Estudiante
from .serializers import ReporteSeleccionElectivasSerializer
from .generador_contenido import GeneradorContenidoReporteSeleccion
from .generador_pdf import crear_pdf
from seleccion_electivas.serializers import ConsultaElectivaEstudianteDTO
class ReporteSeleccionElectivasEstudianteViewSet(viewsets.ViewSet):
    """
    ViewSet para generar reportes de selección de electivas por estudiante.
    """
    serializer_class = ReporteSeleccionElectivasSerializer
    generador_contenido: GeneradorContenidoReporteSeleccion
    
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
        pdf_data = crear_pdf(nombre_archivo,elementos)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{nombre_archivo}.pdf"'
        response.write(pdf_data)
        return response




