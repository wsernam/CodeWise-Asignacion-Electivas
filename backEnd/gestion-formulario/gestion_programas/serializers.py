from rest_framework import serializers
from gestion_electivas.models import Programa, Facultad

class ProgramaSerializer(serializers.ModelSerializer):
    fac_codigo = serializers.PrimaryKeyRelatedField(queryset=Facultad.objects.all())
    fac_nombre = serializers.CharField(source='fac_codigo.fac_nombre', read_only=True)

    class Meta:
        model = Programa
        fields = ['pro_codigo', 'pro_nombre', 'fac_codigo', 'fac_nombre', 'pro_activo']
        read_only_fields = ['pro_codigo', 'fac_nombre']

    def validate(self, attrs):
        pro_nombre = attrs.get('pro_nombre') or (self.instance and self.instance.pro_nombre)
        fac = attrs.get('fac_codigo') or (self.instance and self.instance.fac_codigo)
        faltantes = []
        if not pro_nombre: faltantes.append('pro_nombre')
        if not fac:        faltantes.append('fac_codigo')
        if faltantes:
            raise serializers.ValidationError({
                "detalle": "Debe completar todos los datos obligatorios para registrar el programa.",
                "faltantes": faltantes
            })
        # Duplicados (ajusta a tu regla: global o por facultad)
        qs = Programa.objects.filter(pro_nombre__iexact=pro_nombre)
        # si usas la restricción por facultad, descomenta la siguiente línea:
        # qs = qs.filter(fac_codigo=fac)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError({"detalle": "El programa ya se encuentra registrado."})
        return attrs
