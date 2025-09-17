from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from gestion_electivas.models import Programa
from .serializers import ProgramaSerializer
import logging

logger = logging.getLogger(__name__)

class ProgramaViewSet(viewsets.ModelViewSet):
    """
    CRUD estándar + acciones: desactivar / reactivar
    """
    queryset = Programa.objects.select_related('fac_codigo').all()
    serializer_class = ProgramaSerializer

    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        programa = self.get_object()
        if not programa.pro_activo:
            return Response({"mensaje": "El programa ya está desactivado."}, status=status.HTTP_200_OK)
        programa.pro_activo = False
        programa.save(update_fields=['pro_activo'])
        return Response({"mensaje": "Programa desactivado."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reactivar(self, request, pk=None):
        programa = self.get_object()
        if programa.pro_activo:
            return Response({"mensaje": "El programa ya está activo."}, status=status.HTTP_200_OK)
        programa.pro_activo = True
        programa.save(update_fields=['pro_activo'])
        return Response({"mensaje": "Programa reactivado."}, status=status.HTTP_200_OK)
