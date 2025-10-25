from rest_framework import serializers

from seleccion_electivas.models import SeleccionEstudianteElectiva
from gestion_estudiantes.serializers import EstudianteSerializer
from seleccion_electivas.serializers import ElectivaPrioridadDTO

class ReporteSeleccionElectivasSerializer(serializers.Serializer):
    estudiante  = EstudianteSerializer(read_only=True, source='est_codigo')
    electivas = ElectivaPrioridadDTO(many=True)
    sel_anio = serializers.IntegerField(source='sel_anio')
    sel_num_semestre = serializers.IntegerField(source='sel_num_semestre')