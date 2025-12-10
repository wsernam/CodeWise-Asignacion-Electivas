from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Facultad, Electiva

class FacultadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facultad
        fields = '__all__'


class ElectivaSerializer(serializers.ModelSerializer):
    ele_nombre = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Electiva.objects.all(),
                message="El nombre de la electiva ya está en uso."
            )
        ]
    )
    ele_cupos = serializers.IntegerField(
        required=True,
        allow_null=False,
        min_value=1,
        error_messages={
            "required": "El campo 'Número de cupos máximo' es obligatorio.",
            "invalid": "El campo 'Número de cupos máximo' debe ser un número entero.",
            "min_value": "El número de cupos debe ser al menos 1."
        }
    )

    class Meta:
        model = Electiva
        fields = '__all__'   # incluye todos los campos del modelo
        
    