from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from django.db import IntegrityError
from gestion_electivas.models import Programa
from .serializers import ProgramaSerializer
import logging

logger = logging.getLogger(__name__)

class ProgramaViewSet(viewsets.ModelViewSet):
    """
    CRUD estándar + acciones: desactivar / reactivar
    Respuestas simplificadas: solo códigos (status), sin mensajes en el body.
    """
    queryset = Programa.objects.select_related('fac_codigo').all()
    serializer_class = ProgramaSerializer

    # ---- Centralizar manejo de errores ----
    def handle_exception(self, exc):
        if isinstance(exc, (ValidationError, IntegrityError)):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if isinstance(exc, NotFound):
            return Response(status=status.HTTP_404_NOT_FOUND)
        if isinstance(exc, PermissionDenied):
            return Response(status=status.HTTP_403_FORBIDDEN)
        # Otros errores → 500
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ---- Respuestas CRUD ----
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ---- Acciones personalizadas ----
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        programa = self.get_object()
        if programa.pro_activo:  # si está activo lo desactiva
            programa.pro_activo = False
            programa.save(update_fields=['pro_activo'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def reactivar(self, request, pk=None):
        programa = self.get_object()
        if not programa.pro_activo:  # si está inactivo lo reactiva
            programa.pro_activo = True
            programa.save(update_fields=['pro_activo'])
        return Response(status=status.HTTP_204_NO_CONTENT)
