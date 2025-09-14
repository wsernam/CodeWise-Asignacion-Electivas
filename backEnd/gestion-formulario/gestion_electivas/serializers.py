from rest_framework import serializers
from .models import Facultad, Electiva

class FacultadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facultad
        fields = '__all__'


class ElectivaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Electiva
        fields = '__all__'   # incluye todos los campos del modelo
    
    def validate_ele_nombre(self, value):
        if Electiva.objects.filter(ele_nombre=value).exists():
            raise serializers.ValidationError(
                {"error": "El nombre ya está en uso."}  # <- personalizado
            )
        return value