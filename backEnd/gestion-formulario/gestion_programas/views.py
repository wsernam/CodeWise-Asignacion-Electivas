from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from gestion_electivas.models import Programa, Facultad
from .serializers import ProgramaSerializer, FacultadSerializer
import logging
from django.db import transaction
from events.programa_publisher import publish_programa_creado, publish_programa_actualizado, publish_programa_eliminado
from core.permissions import IsAdministrador
from rest_framework.permissions import AllowAny
logger = logging.getLogger(__name__)

class ProgramaViewSet(viewsets.ModelViewSet):
    """
    CRUD estándar + acciones: desactivar / reactivar
    """
    queryset = Programa.objects.select_related('fac_codigo').all()
    serializer_class = ProgramaSerializer
    
    def get_permissions(self):
        """
        Asigna permisos basados en la acción.
        - Permite acceso público para consultas (list, retrieve).
        - Requiere rol de Administrador para todas las demás acciones.
        """
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAdministrador]
        return super().get_permissions()

    def perform_create(self, serializer):
        instance = serializer.save()
        transaction.on_commit(lambda: publish_programa_creado(_serialize_programa(instance)))

    def perform_update(self, serializer):
        instance = serializer.save()
        payload = _serialize_programa(instance)
        transaction.on_commit(lambda: publish_programa_actualizado(payload))

    def perform_destroy(self, instance):
        # captura datos antes de borrar
        payload = _serialize_programa(instance)
        super().perform_destroy(instance)
        transaction.on_commit(lambda: publish_programa_eliminado(payload))


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
    
def _serialize_programa(p: Programa) -> dict:
    return {
        "pro_codigo": getattr(p, "pro_codigo", None),   # 👈 BIEN
        "pro_nombre": p.pro_nombre,
        "pro_activo": p.pro_activo,
        "fac_codigo": getattr(p.fac_codigo, "fac_codigo", None),
        "fac_nombre": getattr(p.fac_codigo, "fac_nombre", None),  # solo como info
    }

class FacultadViewSet(viewsets.ModelViewSet): 
    """
    CRUD para Facultades
    """
    queryset = Facultad.objects.all()
    serializer_class = FacultadSerializer

    @action(detail=False, methods=['get'])
    def activas(self, request):
        """Obtiene facultades que tienen programas activos"""
        facultades = Facultad.objects.filter(programas__pro_activo=True).distinct()
        serializer = self.get_serializer(facultades, many=True)
        return Response(serializer.data)