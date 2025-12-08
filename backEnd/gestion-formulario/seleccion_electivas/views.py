
from rest_framework import viewsets, status, mixins
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SeleccionEstudianteElectiva
from .serializers import CrearSeleccionElectivaDTO, SeleccionEstudianteElectivaSerializer, ConsultaElectivaEstudianteDTO
from gestion_electivas.models import Electiva
from django.db import transaction
from events.seleccion_publisher import publish_seleccion_creada
from core.permissions import IsAdministrador
from rest_framework.permissions import AllowAny

from events.seleccion_publisher import publish_seleccion_creada

class SeleccionEstudianteElectivaViewSet(mixins.CreateModelMixin,
                                       viewsets.GenericViewSet):
    

    def create(self, request):
        """
        Crea una selección de electivas para un estudiante.
        Recibe:
        {
            "est_codigo": 123,
            "sel_anio": 2025,
            "sel_num_semestre": 1,
            "est_correo": ashleecampaz"
            "electivas": [
                {"ele_codigo": 101, "sel_prioridad": 1},
                {"ele_codigo": 102, "sel_prioridad": 2},
            ]
        }
        """
        serializer = CrearSeleccionElectivaDTO(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        est_codigo = validated_data["est_codigo"]
        sel_anio = validated_data["sel_anio"]
        sel_num_semestre = validated_data["sel_num_semestre"]
        electivas_data = validated_data["electivas"]

        # Usamos una transacción para asegurar que todas las selecciones se creen o ninguna.
        with transaction.atomic():
            # Creamos una lista de objetos para insertar en lote
            selecciones_a_crear = [
                SeleccionEstudianteElectiva(
                    est_codigo_id=est_codigo,
                    sel_anio=sel_anio,
                    sel_num_semestre=sel_num_semestre,
                    ele_codigo_id=electiva["ele_codigo"],
                    sel_prioridad=electiva["sel_prioridad"],
                )
                for electiva in electivas_data
            ]

            # Usamos bulk_create para una inserción eficiente en la base de datos
            created_instances = SeleccionEstudianteElectiva.objects.bulk_create(selecciones_a_crear)
            electivas_prioridad_nombre = []
            for ele in serializer.data.get("electivas", []):
                electiva_prioridad =ele
                electiva =  Electiva.objects.filter(ele_codigo = electiva_prioridad["ele_codigo"]).first()
                electiva_prioridad["ele_nombre"] = electiva.ele_nombre
                electivas_prioridad_nombre.append(electiva_prioridad)
            print(electivas_prioridad_nombre,flush=True)
            datos_correo = request.data
            datos_correo["electivas"] = electivas_prioridad_nombre
            print(datos_correo, flush=True)
            # Publicamos un evento por cada selección creada
            transaction.on_commit(lambda: publish_seleccion_creada(datos_correo))
            
        return Response(
            {
                "detail": f"Se han registrado {len(created_instances)} electivas para el estudiante {est_codigo}."
            },
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
        ).select_related('ele_codigo').order_by('sel_prioridad')

        if not queryset.exists():
            return Response(
                {"detail": "No se encontraron selecciones para los criterios especificados."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Usamos un serializador para formatear la respuesta, es más limpio.
        # select_related optimiza la consulta para evitar N+1 queries.
        data = ConsultaElectivaEstudianteDTO(queryset, many=True).data
        
        return Response(data, status=status.HTTP_200_OK)
    
    @action(
    detail=False,
    methods=["get"],
    url_path=r"consulta-dashboard/(?P<pro_codigo>[\w-]+)/(?P<sel_anio>\d+)/(?P<sel_num_semestre>\d+)"
    )
    def conteo_inscritos_por_electiva(self, request, pro_codigo=None, sel_anio=None, sel_num_semestre=None):
        """
        Cuenta la cantidad de estudiantes inscritos por electiva,
        filtrando por programa, año y semestre.

        Si pro_codigo == "Todos":
            - Devuelve inscritos por electiva
            - Total global de estudiantes
            - Totales por programa

        Si pro_codigo != "Todos":
            - Devuelve inscritos por electiva
            - Total global de estudiantes del programa
        """

        base_filter = {
            "sel_anio": sel_anio,
            "sel_num_semestre": sel_num_semestre,
        }

        # Si filtra por un programa específico
        if pro_codigo != "Todos":
            base_filter["est_codigo__pro_codigo__pro_codigo"] = pro_codigo

        # ============================
        # 1. Query: Inscritos por electiva
        # ============================
        queryset = (
            SeleccionEstudianteElectiva.objects
            .filter(**base_filter)
            .select_related("ele_codigo")
            .values(
                "ele_codigo__ele_codigo",
                "ele_codigo__ele_nombre",
                "ele_codigo__pro_codigo__pro_codigo"
            )
            .annotate(inscritos=Count("est_codigo", distinct=True))
            .order_by("ele_codigo__ele_codigo")
        )

        if not queryset.exists():
            return Response(
                {"detail": "No se encontraron registros para los filtros especificados."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Convertimos a lista de salida
        data = [
            {
                "ele_codigo": item["ele_codigo__ele_codigo"],
                "ele_nombre": item["ele_codigo__ele_nombre"],
                "pro_codigo": item["ele_codigo__pro_codigo__pro_codigo"],
                "inscritos": item["inscritos"]
            }
            for item in queryset
        ]

        # ============================
        # 2. TOTAL global de estudiantes inscritos
        # ============================
        total_estudiantes = (
            SeleccionEstudianteElectiva.objects
            .filter(**base_filter)
            .values("est_codigo")
            .distinct()
            .count()
        )

        response_payload = {
            "total": total_estudiantes,
            "data": data
        }

        # ============================
        # 3. Si pro_codigo == "Todos", agregar totales por programa
        # ============================
        if pro_codigo == "Todos":
            totales_por_programa = (
                SeleccionEstudianteElectiva.objects
                .filter(sel_anio=sel_anio, sel_num_semestre=sel_num_semestre)
                .values("est_codigo__pro_codigo__pro_codigo")
                .annotate(total=Count("est_codigo", distinct=True))
                .order_by("est_codigo__pro_codigo__pro_codigo")
            )

            response_payload["totales"] = [
            {
                "pro_codigo": item["est_codigo__pro_codigo__pro_codigo"],
                "total_inscritos": item["total"]
            }
            for item in totales_por_programa
]


        return Response(response_payload, status=status.HTTP_200_OK)


def _serialize_seleccion(s: SeleccionEstudianteElectiva) -> dict:
    """Convierte el objeto SeleccionEstudianteElectiva en un dict para RabbitMQ."""
    return {
        "sel_codigo": s.sel_codigo,
        "sel_anio": s.sel_anio,
        "sel_num_semestre": s.sel_num_semestre,
        "sel_prioridad": s.sel_prioridad,
        "est_codigo": getattr(s.est_codigo, "est_codigo", None),
        "ele_codigo": getattr(s.ele_codigo, "ele_codigo", None),
    }