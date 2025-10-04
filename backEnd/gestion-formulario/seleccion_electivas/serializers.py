from rest_framework import serializers
from .models import SeleccionEstudianteElectiva
from gestion_electivas.models import Electiva
from rest_framework.exceptions import ValidationError
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
    sel_anio = serializers.IntegerField()
    sel_num_semestre = serializers.ChoiceField(choices=[1, 2])
    electivas = ElectivaPrioridadDTO(many=True)

    def validate_duplicados(self, data):
        # Contar ele_codigo y sel_prioridad
        electivas = data["electivas"]
        codigos = [e["ele_codigo"] for e in electivas]
        prioridades = [e["sel_prioridad"] for e in electivas]

        duplicados_codigos = [item for item, count in Counter(codigos).items() if count > 1]
        duplicados_prioridades = [item for item, count in Counter(prioridades).items() if count > 1]

        errores_duplicados = {}
        if duplicados_codigos:
           errores_duplicados["electivas"] =(
                f"Los siguientes ele_codigo están repetidos dentro de la misma selección: {duplicados_codigos}"
            )

        if duplicados_prioridades:
            errores_duplicados["prioridades"] =(
                f"Las siguientes sel_prioridad están repetidas dentro de la misma selección: {duplicados_prioridades}"
            )
        if errores_duplicados:
            raise ValidationError(errores_duplicados)
    
    def validate(self,data):
        """
        Verifica que ninguna de las electivas esté ya registrada en la base de datos
        con la misma combinación única: (sel_anio, sel_num_semestre, ele_codigo, est_codigo).
        """
        # Primero valida que no haya duplicados en la misma solicitud
        self.validate_duplicados(data)
        est_codigo = data["est_codigo"]
        sel_anio = data["sel_anio"]
        sel_num_semestre = data["sel_num_semestre"]

        conflictos_electivas = []
        conflictos_prioridades = []
        
        for electiva in data["electivas"]:
            existe_conflicto_electiva = SeleccionEstudianteElectiva.objects.filter(
                sel_anio=sel_anio,
                sel_num_semestre=sel_num_semestre,
                est_codigo=est_codigo,
                ele_codigo=electiva.get("ele_codigo")
            ).exists()
            existe_conflicto_prioridad = SeleccionEstudianteElectiva.objects.filter(
                sel_anio=sel_anio,
                sel_num_semestre=sel_num_semestre,
                est_codigo=est_codigo,
                sel_prioridad=electiva.get("sel_prioridad")
            ).exists()
            if existe_conflicto_prioridad:
                conflictos_prioridades.append(electiva.get("sel_prioridad"))
            if existe_conflicto_electiva:
                conflictos_electivas.append(electiva.get("ele_codigo"))

        
        errores = {}
        if conflictos_electivas:
            errores["electivas"] = (
                f"Las siguientes electivas ya están registradas para "
                f"estudiante={est_codigo}, año={sel_anio}, semestre={sel_num_semestre}: {conflictos_electivas}"
            )
        if conflictos_prioridades:
            errores["prioridades"] = (
                f"Las siguientes prioridades ya están en uso para "
                f"estudiante={est_codigo}, año={sel_anio}, semestre={sel_num_semestre}: {conflictos_prioridades}"
            )

        if errores:
            raise ValidationError(errores)
        return data
class SeleccionEstudianteElectivaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeleccionEstudianteElectiva
        fields = '__all__'

