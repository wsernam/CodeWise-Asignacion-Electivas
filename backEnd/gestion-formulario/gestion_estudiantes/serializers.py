from rest_framework import serializers
from gestion_estudiantes.models import Estudiante
import re

class EstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        # 'est_codigo' ya no es de solo lectura, ahora se debe proveer al crear.
        fields = ['est_codigo', 'est_nombre', 'est_apellido', 'pro_codigo', 'est_correo']

     # --- Validaciones específicas para nombre y apellido ---
    def validate_est_nombre(self, value: str) -> str:
        nombre = ' '.join((value or '').strip().split())

        if re.search(r'\d', nombre):
            raise serializers.ValidationError("El nombre no puede contener números.")

        patron = r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']{2,}$"
        if not re.match(patron, nombre):
            raise serializers.ValidationError(
                "El nombre solo puede contener letras, espacios, guiones o apóstrofes (mínimo 2 caracteres)."
            )
        return nombre

    def validate_est_apellido(self, value: str) -> str:
        apellido = ' '.join((value or '').strip().split())

        if re.search(r'\d', apellido):
            raise serializers.ValidationError("El apellido no puede contener números.")

        patron = r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']{2,}$"
        if not re.match(patron, apellido):
            raise serializers.ValidationError(
                "El apellido solo puede contener letras, espacios, guiones o apóstrofes (mínimo 2 caracteres)."
            )
        return apellido # --- Validaciones específicas para nombre y apellido ---
    def validate_est_nombre(self, value: str) -> str:
        nombre = ' '.join((value or '').strip().split())

        if re.search(r'\d', nombre):
            raise serializers.ValidationError("El nombre no puede contener números.")

        patron = r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']{2,}$"
        if not re.match(patron, nombre):
            raise serializers.ValidationError(
                "El nombre solo puede contener letras, espacios, guiones o apóstrofes (mínimo 2 caracteres)."
            )
        return nombre

    def validate_est_apellido(self, value: str) -> str:
        apellido = ' '.join((value or '').strip().split())

        if re.search(r'\d', apellido):
            raise serializers.ValidationError("El apellido no puede contener números.")

        patron = r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\-']{2,}$"
        if not re.match(patron, apellido):
            raise serializers.ValidationError(
                "El apellido solo puede contener letras, espacios, guiones o apóstrofes (mínimo 2 caracteres)."
            )
        return apellido