
from rest_framework import serializers
from .models import SeleccionEstudianteElectiva
from gestion_electivas.models import Electiva
from collections import Counter

class ElectivaPrioridadDTO(serializers.Serializer):
    sel_prioridad = serializers.IntegerField()
    ele_codigo = serializers.IntegerField()
    ele_nombre = serializers.CharField(max_length=100)


class ConsultaElectivaEstudianteDTO(serializers.Serializer):
    ele_codigo = serializers.IntegerField()
    ele_nombre = serializers.CharField(max_length=100)
    sel_prioridad = serializers.IntegerField()
class CrearSeleccionElectivaDTO(serializers.Serializer):
    est_codigo = serializers.IntegerField()
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

    def validate(self, data):
        """
        Validación optimizada para verificar conflictos con la base de datos en una sola consulta.
        """
        est_codigo = data["est_codigo"]
        sel_anio = data["sel_anio"]
        sel_num_semestre = data["sel_num_semestre"]
        electivas_data = data["electivas"]

        codigos_nuevos = {e['ele_codigo'] for e in electivas_data}
        prioridades_nuevas = {e['sel_prioridad'] for e in electivas_data}

        # Hacemos una única consulta a la BD para buscar todos los posibles conflictos
        selecciones_existentes = SeleccionEstudianteElectiva.objects.filter(
            est_codigo=est_codigo,
            sel_anio=sel_anio,
            sel_num_semestre=sel_num_semestre
        ).values_list('ele_codigo_id', 'sel_prioridad')

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
            errores["electivas_conflictos"] = (
                f"El estudiante ya tiene registradas las electivas con código {list(conflictos_electivas)} para este periodo."
            )
        if conflictos_prioridades:
            errores["prioridades_conflictos"] = (
                f"El estudiante ya tiene en uso las prioridades {list(conflictos_prioridades)} para este periodo."
            )

        if errores:
            raise serializers.ValidationError(errores)

        return data

class SeleccionEstudianteElectivaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeleccionEstudianteElectiva
        fields = '__all__'