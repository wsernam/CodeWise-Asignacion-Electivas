from rest_framework import serializers
from .models import Oferta_electiva
from gestion_electivas.models import Electiva, Programa

class OfertaElectivaSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar el nombre en lugar de IDs
    # `source` indica el campo del modelo de donde se toma el dato
    ele_nombre = serializers.CharField(source='ele_codigo.ele_nombre', read_only=True)
    pro_nombre = serializers.CharField(source='pro_codigo.pro_nombre', read_only=True)

    class Meta:
        model = Oferta_electiva
        # Los campos que se incluirán en el serializador.
        # `__all__` incluye todos los campos del modelo.
        # También podrías listarlos explícitamente:
        # fields = ['ofe_codigo', 'ofe_anio', 'ofe_num_semestre', 'ele_codigo', 'pro_codigo']
        fields = '__all__'