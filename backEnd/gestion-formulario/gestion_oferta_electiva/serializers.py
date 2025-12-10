from rest_framework import serializers
from .models import Oferta_electiva, Oferta_formulario
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

class OfertaItemSerializer(serializers.Serializer):
    """Serializador para un item individual dentro de la lista de ofertas en lote."""
    ele_codigo = serializers.PrimaryKeyRelatedField(queryset=Electiva.objects.all())
    pro_codigo = serializers.PrimaryKeyRelatedField(queryset=Programa.objects.all())

class OfertaElectivaBulkCreateSerializer(serializers.Serializer):
    """
    Serializador para la creación en lote de ofertas de electivas.
    Espera un año, semestre y una lista de objetos, cada uno con una electiva y un programa.
    """
    ofe_anio = serializers.IntegerField(min_value=2000)
    ofe_num_semestre = serializers.ChoiceField(choices=[(1, "I"), (2, "II")])
    ofe_cant_electivas =  serializers.IntegerField(min_value=1)
    ofertas = serializers.ListField(
        child=OfertaItemSerializer(),
        write_only=True,
        allow_empty=False
    )

    def validate_ofertas(self, ofertas):
        """
        Valida que no haya combinaciones duplicadas de electiva y programa en la lista de ofertas.
        """
        vistos = set()
        for item in ofertas:
            identificador = (item['ele_codigo'].pk, item['pro_codigo'].pk)
            if identificador in vistos:
                raise serializers.ValidationError(
                    f"La combinación de electiva ({item['ele_codigo']}) y programa ({item['pro_codigo']}) está duplicada en la solicitud."
                )
            vistos.add(identificador)
        return ofertas


    def create(self, validated_data):
        anio = validated_data.get('ofe_anio')
        semestre = validated_data.get('ofe_num_semestre')
        ofertas_data = validated_data.get('ofertas')
        cantidad_electivas = validated_data.get("ofe_cant_electivas")
        ofertas_a_crear = []
        ofertas_existentes = []
        ofe_pro_codigo : int
        # 1. Separar las ofertas que ya existen de las que se van a crear
        for item in ofertas_data:
            ele_codigo = item['ele_codigo']
            pro_codigo = item['pro_codigo']
            ofe_pro_codigo = pro_codigo
            if Oferta_electiva.objects.filter(
                ofe_anio=anio,
                ofe_num_semestre=semestre,
                ele_codigo=ele_codigo,
                pro_codigo=pro_codigo
            ).exists():
                ofertas_existentes.append({
                    'ele_codigo': ele_codigo.pk,
                    'ele_nombre': ele_codigo.ele_nombre,
                    'pro_codigo': pro_codigo.pk,
                    'pro_nombre': pro_codigo.pro_nombre,
                    'detalle': 'Esta oferta ya existe en la base de datos.'
                })
            else:
                ofertas_a_crear.append(
                    Oferta_electiva(
                        ofe_anio=anio,
                        ofe_num_semestre=semestre,
                        ele_codigo=ele_codigo,
                        pro_codigo=pro_codigo
                    )
                )

        # consultar si exite
        ofe_formulario = Oferta_formulario.objects.filter(
                ofefor_anio=anio,
                ofefor_num_semestre=semestre,
                pro_codigo=ofe_pro_codigo
            ).first()
        if ofe_formulario:
            ofe_formulario.ofefor_cantidad_electivas = cantidad_electivas
            ofe_formulario.save()
        else:    
            ofe_formulario = Oferta_formulario(ofefor_anio=anio,
                                            ofefor_num_semestre = semestre,
                                            pro_codigo = ofe_pro_codigo,
                                            ofefor_cantidad_electivas = cantidad_electivas)
            Oferta_formulario.objects.create(ofe_formulario)
        # 2. Crear las nuevas ofertas en lote (si hay alguna)
        if ofertas_a_crear:
            # Usamos bulk_create sin ignore_conflicts para asegurar la integridad.
            # Como ya filtramos duplicados, no debería haber errores aquí.
            Oferta_electiva.objects.bulk_create(ofertas_a_crear)

        # 3. Recuperar las ofertas recién creadas para obtener sus IDs
        # Construimos una consulta para encontrar exactamente los objetos que acabamos de crear.
        pks_creadas = [
            (oferta.ele_codigo.pk, oferta.pro_codigo.pk) for oferta in ofertas_a_crear
        ]
        objetos_creados = Oferta_electiva.objects.filter(
            ofe_anio=anio,
            ofe_num_semestre=semestre,
            ele_codigo__in=[pk[0] for pk in pks_creadas],
            pro_codigo__in=[pk[1] for pk in pks_creadas]
        ).values(
            'ofe_codigo',
            'ofe_anio',
            'ofe_num_semestre',
            'ele_codigo',              # 👈 PK de la electiva (para FK en asignación)
            'pro_codigo',              # 👈 PK del programa
            'ele_codigo__ele_nombre',
            'pro_codigo__pro_nombre',
        )

        return {
            'creadas': list(objetos_creados),
            'existentes': ofertas_existentes,
        }
