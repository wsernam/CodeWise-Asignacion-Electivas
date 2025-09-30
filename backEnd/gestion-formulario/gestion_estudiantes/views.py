from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from django.db import IntegrityError
from gestion_estudiantes.models import Estudiante
from .serializers import EstudianteSerializer

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.select_related('pro_codigo').all()
    serializer_class = EstudianteSerializer

    # --- Manejo de errores solo por códigos ---
    def handle_exception(self, exc):
        if isinstance(exc, (ValidationError, IntegrityError)):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if isinstance(exc, NotFound):
            return Response(status=status.HTTP_404_NOT_FOUND)
        if isinstance(exc, PermissionDenied):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # --- CRUD devolviendo solo códigos ---
    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        self.perform_create(ser)
        return Response(status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        ser = self.get_serializer(instance, data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        self.perform_update(ser)
        return Response(status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        self.perform_destroy(self.get_object())
        return Response(status=status.HTTP_204_NO_CONTENT)
