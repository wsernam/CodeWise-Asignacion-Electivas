from rest_framework import serializers
from gestion_estudiantes.models import Estudiante

class EstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        # 'est_codigo' ya no es de solo lectura, ahora se debe proveer al crear.
        fields = ['est_codigo', 'est_nombre', 'est_apellido', 'pro_codigo', 'est_correo']

    def validate_est_nombre(self, v): return v.strip()
    def validate_est_apellido(self, v): return v.strip()
