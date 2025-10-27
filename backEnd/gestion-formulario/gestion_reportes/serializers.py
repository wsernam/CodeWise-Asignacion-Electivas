from rest_framework import serializers

from seleccion_electivas.serializers import ConsultaElectivaEstudianteDTO
from gestion_estudiantes.models import Estudiante
from gestion_oferta_electiva.models import Oferta_electiva
from gestion_electivas.models import Electiva
from gestion_electivas.serializers import ElectivaSerializer
class EstudianteSerializer(serializers.ModelSerializer):
    pro_nombre = serializers.CharField(source='pro_codigo.pro_nombre', read_only=True)
    class Meta:
        model = Estudiante
        # 'est_codigo' ya no es de solo lectura, ahora se debe proveer al crear.
        fields = ['est_codigo', 'est_nombre', 'est_apellido', 'pro_codigo', 'est_correo', 'pro_nombre']

    def validate_est_nombre(self, v): return v.strip()
    def validate_est_apellido(self, v): return v.strip()

class ReporteSeleccionElectivasSerializer(serializers.Serializer):
    estudiante  = EstudianteSerializer(read_only=True, source='est_codigo')
    electivas = ConsultaElectivaEstudianteDTO(required=False,many=True)
    sel_anio = serializers.IntegerField(read_only=True)
    sel_num_semestre = serializers.IntegerField(read_only=True)

    def get_electivas(self, obj):
        # Obtener electivas desde el contexto
        electivas = self.context.get('electivas', [])
        return electivas

    def to_representation(self, instance):
        # Llamar la representación base (estudiante, año, semestre)
        rep = super().to_representation(instance)
        # Agregar electivas desde el contexto (si existen)
        rep['electivas'] = self.get_electivas(instance)
        return rep

class ElectivasOfertadasPorProgramaDTO(serializers.Serializer):
    pro_codigo = serializers.CharField(read_only=True)
    pro_nombre = serializers.CharField(read_only=True)
    electivas = ElectivaSerializer(many=True)

    
class ReporteOfertaElectivasSerializer(serializers.Serializer):
    ofe_anio = serializers.IntegerField()
    ofe_num_semestre = serializers.IntegerField()
    ofertas_programas = ElectivasOfertadasPorProgramaDTO(many=True)