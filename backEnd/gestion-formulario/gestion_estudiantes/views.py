from rest_framework import viewsets
from .models import Estudiante # Usar importación relativa es una buena práctica
from .serializers import EstudianteSerializer
from django.db import transaction
from events.estudiante_publisher import publish_estudiante_creado, publish_estudiante_actualizado, publish_estudiante_eliminado
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.select_related('pro_codigo').all()  # FK se llama pro_codigo en el MODELO
    serializer_class = EstudianteSerializer
    permission_classes = [AllowAny]  # ✅ Todas las acciones son públicas

    def perform_create(self, serializer):
        instance = serializer.save()
        transaction.on_commit(lambda: publish_estudiante_creado(_serialize_estudiante(instance)))

    def perform_update(self, serializer):
        instance = serializer.save()
        payload = _serialize_estudiante(instance)
        transaction.on_commit(lambda: publish_estudiante_actualizado(payload))

    def perform_destroy(self, instance):
        # captura datos antes de borrar
        payload = _serialize_estudiante(instance)
        super().perform_destroy(instance)
        transaction.on_commit(lambda: publish_estudiante_eliminado(payload))

    @action(detail=False, methods=['get'])
    def all(self, request):
        estudiantes = Estudiante.objects.all()
        serializer = self.get_serializer(estudiantes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def info(self, request):
        # Implement your logic for the 'info' endpoint here
        return Response({"message": "info"})

    @action(detail=False, methods=['get'], url_path='periodo/(?P<anio>\d+)/(?P<semestre>\d+)')
    def por_periodo(self, request, anio=None, semestre=None):
        """
        Retorna los estudiantes que han seleccionado electivas en un período específico.
        """
        # La lógica de filtrado depende de cómo estén relacionados los estudiantes con las selecciones y los períodos.
        # Este es un ejemplo asumiendo una relación a través de 'seleccionelectivas'.
        queryset = Estudiante.objects.filter(
            seleccionestudianteelectiva__sel_anio=anio,
            seleccionestudianteelectiva__sel_num_semestre=semestre
        ).distinct()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# Helper local para armar el payload del evento
def _serialize_estudiante(e: Estudiante) -> dict:
    """
    Convierte el objeto Estudiante en un dict JSON listo para enviar a RabbitMQ.
    Usa los nombres REALES del modelo (según tu POST en Postman).
    """
    return {
        "est_codigo": e.est_codigo,  # o e.est_codigo si así se llama en tu modelo
        "est_nombre": e.est_nombre,
        "est_apellido": e.est_apellido,
        "pro_codigo": getattr(e.pro_codigo, "pro_codigo", None),
        "est_correo": e.est_correo
    }