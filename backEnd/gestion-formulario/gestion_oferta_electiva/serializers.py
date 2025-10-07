from rest_framework import serializers
from .models import Oferta_electiva
from django.db import IntegrityError
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

class ElectivaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Electiva
        fields = ['ele_codigo', 'ele_nombre']

class OfertaElectivaBulkCreateSerializer(serializers.Serializer):
    """
    Serializador para la creación en lote de ofertas de electivas.
    Espera un año, semestre, programa y una lista de IDs de electivas.
    """
    ofe_anio = serializers.IntegerField(min_value=2000)
    ofe_num_semestre = serializers.ChoiceField(choices=[(1, "I"), (2, "II")])
    pro_codigo = serializers.PrimaryKeyRelatedField(
        queryset=Programa.objects.all(),
        write_only=True
    )
    electivas = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Electiva.objects.all()),
        write_only=True,
        allow_empty=False
    )

    def create(self, validated_data):
        anio = validated_data.get('ofe_anio')
        semestre = validated_data.get('ofe_num_semestre')
        programa = validated_data.get('pro_codigo')
        electivas_list = validated_data.get('electivas')

        ofertas_a_crear = [
            Oferta_electiva(
                ofe_anio=anio,
                ofe_num_semestre=semestre,
                pro_codigo=programa,
                ele_codigo=electiva
            ) for electiva in electivas_list
        ]

        # Usamos bulk_create para crear todos los objetos en una sola consulta
        # ignore_conflicts=True evita que la operación se detenga si una oferta ya existe
        ofertas_creadas = Oferta_electiva.objects.bulk_create(ofertas_a_crear, ignore_conflicts=True)
        return {'creadas': len(ofertas_creadas), 'solicitadas': len(ofertas_a_crear)}