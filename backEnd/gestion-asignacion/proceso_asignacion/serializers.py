from rest_framework import serializers
from .models import ProcesoAsignacion

class ProcesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcesoAsignacion
        fields = (
            "pa_codigo",                 # <- importante: tu PK
            "pa_paso_actual",
            "pa_anio",
            "pa_num_semestre",
            "pa_fecha_creacion",
            "pa_ultima_fecha_actualizacion",
            "pa_estado",
        )
        read_only_fields = ("pa_fecha_creacion", "pa_ultima_fecha_actualizacion")

    def validate(self, data):
        sem = data.get("pa_num_semestre", getattr(self.instance, "pa_num_semestre", None))
        if sem not in (1, 2):
            raise serializers.ValidationError({"pa_num_semestre": "Debe ser 1 o 2."})
        return data


class ProcesoCambiarEstadoIn(serializers.Serializer):
    pa_estado = serializers.ChoiceField(choices=ProcesoAsignacion.Estado.choices)
