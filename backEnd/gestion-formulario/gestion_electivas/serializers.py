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
    class Meta:
        model = Electiva
        fields = '__all__'   # incluye todos los campos del modelo
        
    