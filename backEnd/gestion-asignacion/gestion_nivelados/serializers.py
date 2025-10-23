from rest_framework import serializers
from gestion_hojas_de_calculo.models import PerfilAcademico
from referencias.models import Estudiante, Programa

class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = ['pro_codigo', 'pro_nombre']
class EstudianteSerializer(serializers.ModelSerializer):
    programa = ProgramaSerializer(read_only=True, source='pro_codigo')
    class Meta:
        model = Estudiante
        fields = ['est_codigo', 'est_nombre', 'est_apellido','programa']

class consultaNiveladosSerializer(serializers.ModelSerializer):
    estudiante = EstudianteSerializer(read_only=True, source='est_codigo')
    class Meta:
        model = PerfilAcademico
        fields = ['estudiante','creditos_aprob_total','porcentaje_avance','num_periodos_matriculados']