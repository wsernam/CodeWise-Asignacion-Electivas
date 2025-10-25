
from rest_framework import serializers
from .models import SeleccionEstudianteElectiva
from gestion_electivas.models import Electiva
from collections import Counter
from gestion_estudiantes.models import Estudiante
from gestion_oferta_electiva.models import Oferta_electiva
class ElectivaPrioridadDTO(serializers.Serializer):
    sel_prioridad = serializers.IntegerField()
    ele_codigo = serializers.CharField(max_length=225)
    ele_nombre = serializers.CharField(max_length=100)


class ConsultaElectivaEstudianteDTO(serializers.Serializer):
    ele_codigo = serializers.CharField(source='ele_codigo.ele_codigo', max_length=225)
    ele_nombre = serializers.CharField(source='ele_codigo.ele_nombre', max_length=100)
    sel_prioridad = serializers.IntegerField()

class CrearSeleccionElectivaDTO(serializers.Serializer):
    est_codigo = serializers.CharField(max_length=225)
    est_correo = serializers.CharField(max_length=100)
    sel_anio = serializers.IntegerField()
    sel_num_semestre = serializers.ChoiceField(choices=[1, 2])
    electivas = ElectivaPrioridadDTO(many=True)

    def validate_electivas(self, electivas):
        """
        Valida que no haya códigos de electiva o prioridades duplicadas en la lista de entrada.
        """
        if not electivas:
            raise serializers.ValidationError("La lista de electivas no puede estar vacía.")

        codigos = [e["ele_codigo"] for e in electivas]
        prioridades = [e["sel_prioridad"] for e in electivas]

        # Counter nos ayuda a encontrar elementos que aparecen más de una vez
        duplicados_codigos = {item for item, count in Counter(codigos).items() if count > 1}
        duplicados_prioridades = {item for item, count in Counter(prioridades).items() if count > 1}

        errores = []
        if duplicados_codigos:
            errores.append(f"Los siguientes códigos de electiva están duplicados en la solicitud: {list(duplicados_codigos)}.")
        if duplicados_prioridades:
            errores.append(f"Las siguientes prioridades están duplicadas en la solicitud: {list(duplicados_prioridades)}.")

        if errores:
            raise serializers.ValidationError(errores)
        
        return electivas
    
    def validate_oferta(selft, data):
        anio = data['sel_anio']
        semestre = data['sel_num_semestre']
        electivas_data = data['electivas']
        est_codigo = data['est_codigo']
        estudiante = Estudiante.objects.filter(est_codigo=est_codigo).first()
        pro_codigo = estudiante.pro_codigo.pro_codigo
        ofertas_disponibles = Oferta_electiva.objects.filter(
            ofe_anio=anio,
            ofe_num_semestre=semestre,
            pro_codigo__pro_codigo=pro_codigo
        ).values_list('ele_codigo__ele_codigo', flat=True)
        codigos_solicitados = {e['ele_codigo'] for e in electivas_data}

        electivas_sin_oferta = codigos_solicitados - set(ofertas_disponibles)
        errores = {}
        if electivas_sin_oferta:
            errores["oferta"] = (
                f"Las siguientes electivas no hacen parte de la oferta para el año {anio}, semestre {semestre} y programa {pro_codigo}: {list(electivas_sin_oferta)}."
            )
            raise serializers.ValidationError(errores)
    def validate(self, data):
        """
        Validación optimizada para verificar:
        1. Que todas las electivas existan en la base de datos.
        2. Conflictos de duplicados (electivas y prioridades) con registros existentes en la BD.
        """
        electivas_data = data["electivas"]
        codigos_nuevos = {e['ele_codigo'] for e in electivas_data}

        # 1. Validar que todas las electivas existan
        electivas_existentes_db = set(Electiva.objects.filter(ele_codigo__in=codigos_nuevos).values_list('ele_codigo', flat=True))
        if codigos_nuevos != electivas_existentes_db:
            raise serializers.ValidationError(f"Las siguientes electivas no existen: {list(codigos_nuevos - electivas_existentes_db)}")

        # 2. Validar que las electivas esten ofertadas para el periodo y programa del estudiante
        self.validate_oferta(data)

        est_codigo = data["est_codigo"]
        sel_anio = data["sel_anio"]
        sel_num_semestre = data["sel_num_semestre"]

        prioridades_nuevas = {e['sel_prioridad'] for e in electivas_data}

        # Hacemos una única consulta a la BD para buscar todos los posibles conflictos
        selecciones_existentes = SeleccionEstudianteElectiva.objects.filter(
            est_codigo=est_codigo,
            sel_anio=sel_anio,
            sel_num_semestre=sel_num_semestre
        ).values_list('ele_codigo_id', 'sel_prioridad')
        # ele_codigo_id es el nombre de la columna en la BD, que es un CharField.

        codigos_existentes = set()
        prioridades_existentes = set()
        for ele_id, prio in selecciones_existentes:
            codigos_existentes.add(ele_id)
            prioridades_existentes.add(prio)

        # Comparamos los conjuntos para encontrar conflictos
        conflictos_electivas = codigos_nuevos.intersection(codigos_existentes)
        conflictos_prioridades = prioridades_nuevas.intersection(prioridades_existentes)

        errores = {}
        if conflictos_electivas:
            errores["electivas"] = (
                f"El estudiante ya tiene registradas una o más de las siguientes electivas para este periodo: {list(conflictos_electivas)}."
            )
        if conflictos_prioridades:
            errores["prioridades"] = (
                f"El estudiante ya tiene en uso una o más de las siguientes prioridades para este periodo: {list(conflictos_prioridades)}."
            )

        if errores:
            raise serializers.ValidationError(errores)

        return data

class SeleccionEstudianteElectivaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeleccionEstudianteElectiva
        fields = '__all__'