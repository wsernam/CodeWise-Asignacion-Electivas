
from rest_framework import viewsets, status, mixins
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
                                       mixins.ListModelMixin,
                                       mixins.RetrieveModelMixin,
                                       viewsets.GenericViewSet):
    ...

    def create(self, request):
        serializer = CrearSeleccionElectivaDTO(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        est_codigo = validated_data["est_codigo"]
        sel_anio = validated_data["sel_anio"]
        sel_num_semestre = validated_data["sel_num_semestre"]
        electivas_data = validated_data["electivas"]

        with transaction.atomic():
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

            created_instances = SeleccionEstudianteElectiva.objects.bulk_create(
                selecciones_a_crear
            )

            # 👉 Publicar UN evento por cada selección creada
            def publicar_eventos():
                for sel in created_instances:
                    payload = {
                        "sel_codigo": sel.sel_codigo,
                        "est_codigo": sel.est_codigo_id,
                        "sel_anio": sel.sel_anio,
                        "sel_num_semestre": sel.sel_num_semestre,
                        "sel_prioridad": sel.sel_prioridad,
                        "ele_codigo": sel.ele_codigo_id,
                    }
                    publish_seleccion_creada(payload)

            transaction.on_commit(publicar_eventos)

        return Response(
            {
                "detail": f"Se han registrado {len(created_instances)} electivas para el estudiante {est_codigo}."
            },
            status=status.HTTP_201_CREATED,
        )

    
    
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