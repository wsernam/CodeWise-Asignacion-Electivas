from rest_framework import serializers
from .models import ProcesoAsignacion

class ProcesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcesoAsignacion
        fields = (
            "id",
            "usuario_id",
            "paso_actual",
            "datos_temporales",
            "estado",
            "fecha_actualizacion",
            "creado_en",
        )
        read_only_fields = ("fecha_actualizacion", "creado_en")