from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Electiva
from .serializers import ElectivaSerializer
import logging

logger = logging.getLogger(__name__)

class ElectivaViewSet(viewsets.ModelViewSet):
    queryset = Electiva.objects.all()
    serializer_class = ElectivaSerializer

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

