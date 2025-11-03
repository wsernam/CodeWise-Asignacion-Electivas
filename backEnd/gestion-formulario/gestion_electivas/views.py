from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Electiva
from .serializers import ElectivaSerializer
from rest_framework.exceptions import NotFound
from django.db import transaction
from events.electiva_publisher import publish_electiva_creada, publish_electiva_actualizada, publish_electiva_eliminada
import logging

logger = logging.getLogger(__name__)

class ElectivaViewSet(viewsets.ModelViewSet):
    queryset = Electiva.objects.all()
    serializer_class = ElectivaSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        transaction.on_commit(lambda: publish_electiva_creada(_serialize_electiva(instance)))

    def perform_update(self, serializer):
        instance = serializer.save()
        payload = _serialize_electiva(instance)
        transaction.on_commit(lambda: publish_electiva_actualizada(payload))

    def perform_destroy(self, instance):
        # captura datos antes de borrar
        payload = _serialize_electiva(instance)
        super().perform_destroy(instance)
        transaction.on_commit(lambda: publish_electiva_eliminada(payload))

    def get_object(self):
        try:
            return super().get_object()
        except Exception:
            raise NotFound(detail="La electiva no existe.")
    
    def get_queryset(self):
        """
        Filtra según el parámetro ?status=all o ?status=active
        """
        status = self.request.query_params.get('status')  # lee el parámetro de la URL
        if status == 'active':
            return Electiva.objects.filter(ele_estado=True)
        # por defecto devuelve todas
        return Electiva.objects.all()
    
    @action(detail=True, methods=['patch'])  # endpoint: PATCH /electivas/<pk>/toggle_estado/
    def toggle_estado(self, request, pk=None):
        electiva = self.get_object()
        electiva.ele_estado = not bool(electiva.ele_estado) # cambia de True→False o False→True
        logger.info("El estado de la electiva {electiva.ele_codigo} fue cambiado a ",electiva.ele_estado)
        electiva.save()
        serializer = self.get_serializer(electiva)
        return Response(serializer.data)
    
        # Helper local para armar el payload del evento
def _serialize_electiva(e: Electiva) -> dict:
    """
    Convierte el objeto Electiva en un dict JSON listo para enviar a RabbitMQ.
    Usa los nombres REALES del modelo (según tu POST en Postman).
    """
    return {
        "ele_codigo": getattr(e.ele_codigo, "ele_codigo", None),
        "ele_nombre": e.ele_nombre,
        "ele_estado": e.ele_estado,
        "pro_codigo": getattr(e.pro_codigo, "pro_codigo", None)
    }   

