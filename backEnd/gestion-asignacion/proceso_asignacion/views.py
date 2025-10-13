# proceso_asignacion/api/views.py
from rest_framework import viewsets
from .models import ProcesoAsignacion
from .serializers import ProcesoSerializer

class ProcesoCRUDViewSet(viewsets.ModelViewSet):
    queryset = ProcesoAsignacion.objects.all().order_by("-creado_en")
    serializer_class = ProcesoSerializer
    authentication_classes = []   # sin auth por ahora
    permission_classes = []
