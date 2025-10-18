#!/bin/bash
sed -i 's/\r$//' "$0"

echo "Ejecutando migraciones..."
# Asegurarse de que las migraciones se creen y apliquen correctamente
python manage.py makemigrations
python manage.py migrate

echo "Insertando datos iniciales en la base de datos..."

# Usamos el bloque shell para ejecutar código Python
python manage.py shell <<EOF
from gestion_electivas.models import Programa
from gestion_estudiantes.models import Estudiante
from gestion_electivas.models import Facultad

# --- 1. CREACIÓN DE FACULTAD ---

# Creamos o recuperamos la facultad por nombre
facultad, created_fac = Facultad.objects.get_or_create(
    fac_nombre="Facultad de Ingeniería"
)
print(f"Facultad creada: {created_fac}, código asignado: {facultad.fac_codigo}")

# --- 2. CREACIÓN DE PROGRAMAS ---

# Creamos programas asociados a la facultad
programa_sistemas, _ = Programa.objects.get_or_create(
    pro_nombre="Ingenieria en Sistemas",
    defaults={'fac_codigo': facultad}
)

Programa.objects.get_or_create(
    pro_nombre="Ingenieria Automatica",
    defaults={'fac_codigo': facultad}
)

Programa.objects.get_or_create(
    pro_nombre="Ingenieria Electronica",
    defaults={'fac_codigo': facultad}
)

print("3 programas creados o actualizados")




# --- 2. CREACIÓN DE ESTUDIANTES ---

# Lista de códigos de estudiantes
codigos = [
    104621011351, 100621021344, 104621011382, 104621011377, 
    100621021365, 100621021349, 104621011376, 104621011383, 
    104621021199
]

estudiantes_creados = 0
for codigo in codigos:
    # Usamos get_or_create para manejar los estudiantes.
    # Usamos el pro_codigo_id para asignar la clave foránea por ID, 
    # asumiendo que el programa creado (programa_sistemas) tiene el ID 1.
    estudiante, created_est = Estudiante.objects.get_or_create(
        est_codigo=codigo,
        defaults={
            'est_nombre': f"Nombre{codigo}", 
            'est_apellido': f"Apellido{codigo}", 
            'est_correo': f"correo{codigo}@unicauca.edu.co",
            'pro_codigo_id': programa_sistemas.pro_codigo # Usamos el ID del objeto creado
        }
    )
    if created_est:
        estudiantes_creados += 1

print(f" {estudiantes_creados} estudiantes creados o actualizados con éxito")

EOF

# Ejecuta el servidor de Django
exec "$@"