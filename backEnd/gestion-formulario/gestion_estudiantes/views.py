from rest_framework import viewsets
from gestion_estudiantes.models import Estudiante
from .serializers import EstudianteSerializer
from django.db import transaction
from events.estudiante_publisher import publish_estudiante_creado, publish_estudiante_actualizado, publish_estudiante_eliminado

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.select_related('pro_codigo').all()  # FK se llama pro_codigo en el MODELO
    serializer_class = EstudianteSerializer
    
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