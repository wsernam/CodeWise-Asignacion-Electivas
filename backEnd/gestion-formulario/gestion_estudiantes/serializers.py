from rest_framework import serializers
from gestion_estudiantes.models import Estudiante

class EstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        fields = ['est_codigo', 'est_nombre', 'est_apellido', 'pro_codigo', 'est_correo']
        read_only_fields = ['est_codigo']

    def validate_est_nombre(self, v): return v.strip()
    def validate_est_apellido(self, v): return v.strip()
