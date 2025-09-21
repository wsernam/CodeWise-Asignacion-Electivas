from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import SeleccionEstudianteElectiva
from .serializers import CrearSeleccionElectivaDTO, SeleccionEstudianteElectivaSerializer

# Create your views here.
class SeleccionElectivaViewSet(viewsets.ModelViewSet):
    queryset = SeleccionEstudianteElectiva.objects.all()
    serializer_class = SeleccionEstudianteElectivaSerializer
   
   
    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use el endpoint /seleccion-electivas/create_seleccion para crear selecciones"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
  
    @transaction.atomic
    @action(detail=False, methods=["post"])
    def create_seleccion(self, request):
        """
        Crea una selección de electivas para un estudiante.
        Recibe:
        {
            "est_codigo": 123,
            "sel_anio": 2025,
            "sel_num_semestre": 1,
            "electivas": [
                {"ele_codigo": 101, "sel_prioridad": 1},
                {"ele_codigo": 102, "sel_prioridad": 2}
            ]
        }
        """
        serializer = CrearSeleccionElectivaDTO(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        est_codigo = data["est_codigo"]
        sel_anio = data["sel_anio"]
        sel_num_semestre = data["sel_num_semestre"]

        created_records = []

        # Iterar sobre electivas y crear cada tupla
        for electiva in data["electivas"]:
            obj = SeleccionEstudianteElectiva.objects.create(
                est_codigo_id=est_codigo,
                sel_anio=sel_anio,
                sel_num_semestre=sel_num_semestre,
                ele_codigo_id=electiva["ele_codigo"],
                sel_prioridad=electiva["sel_prioridad"],
            )
            created_records.append(obj.sel_codigo)

        return Response(
            {"message": "Selección creada exitosamente"},
            status=status.HTTP_201_CREATED,
        )
    
    @action(
        detail=False,
        methods=["get"],
        url_path=r"consulta/(?P<est_codigo>\d+)/(?P<sel_anio>\d+)/(?P<sel_num_semestre>\d+)"
    )
    def electivas_por_estudiante(self, request, est_codigo=None, sel_anio=None, sel_num_semestre=None):
        """
        Obtiene todas las electivas seleccionadas por un estudiante 
        en un año y semestre específicos.
        URL de ejemplo:
        GET /consulta/1/2025/1/
        """
        queryset = SeleccionEstudianteElectiva.objects.filter(
            est_codigo=est_codigo,
            sel_anio=sel_anio,
            sel_num_semestre=sel_num_semestre
        ).values("est_codigo","sel_anio","sel_num_semestre","ele_codigo", "sel_prioridad")

        if not queryset.exists():
            return Response(
                {"message": "No se encontraron selecciones para este estudiante"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(list(queryset), status=status.HTTP_200_OK)