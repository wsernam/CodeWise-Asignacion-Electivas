from rest_framework import serializers
from .models import SeleccionEstudianteElectiva

class SeleccionEstudianteElectivaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeleccionEstudianteElectiva
        fields = '__all__'