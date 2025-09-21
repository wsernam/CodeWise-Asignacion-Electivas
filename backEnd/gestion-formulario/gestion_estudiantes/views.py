from rest_framework import viewsets
from gestion_estudiantes.models import Estudiante
from .serializers import EstudianteSerializer

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.select_related('pro_codigo').all()  # FK se llama pro_codigo en el MODELO
    serializer_class = EstudianteSerializer
