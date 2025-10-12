from rest_framework import viewsets, mixins
from .models import SeleccionEstudianteElectiva
from .serializers import SeleccionEstudianteElectivaSerializer
from django.db import transaction
from events.seleccion_publisher import publish_seleccion_creada

class SeleccionEstudianteElectivaViewSet(mixins.CreateModelMixin,
                                       mixins.ListModelMixin,
                                       mixins.RetrieveModelMixin,
                                       viewsets.GenericViewSet):
    """
    ViewSet que solo permite crear, listar y ver detalles de las selecciones.
    No se permite la edición ni la eliminación.
    """
    queryset = SeleccionEstudianteElectiva.objects.all()
    serializer_class = SeleccionEstudianteElectivaSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        transaction.on_commit(lambda: publish_seleccion_creada(_serialize_seleccion(instance)))

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