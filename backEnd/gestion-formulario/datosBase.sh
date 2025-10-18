#!/bin/bash
sed -i 's/\r$//' "$0"

echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Insertando datos iniciales en la base de datos..."

python manage.py shell <<EOF
from gestion_electivas.models import Programa, Facultad
from gestion_estudiantes.models import Estudiante

# --- 1. CREACIÓN DE FACULTAD ---
facultad, created_fac = Facultad.objects.get_or_create(
    fac_nombre="Facultad de Ingeniería"
)
print(f"Facultad creada: {created_fac}, código asignado: {facultad.fac_codigo}")


# --- 2. CREACIÓN DE PROGRAMAS ---
# Asignamos manualmente los códigos de los programas
programas_data = [
    {"pro_codigo": "SIS001", "pro_nombre": "Ingeniería en Sistemas"},
    {"pro_codigo": "AUT001", "pro_nombre": "Ingeniería Automática"},
    {"pro_codigo": "ELE001", "pro_nombre": "Ingeniería Electrónica"},
]

for data in programas_data:
    programa, created_prog = Programa.objects.get_or_create(
        pro_codigo=data["pro_codigo"],
        defaults={
            "pro_nombre": data["pro_nombre"],
            "fac_codigo": facultad,
            "pro_activo": True
        }
    )
    print(f"Programa {data['pro_nombre']} {'creado' if created_prog else 'ya existía'} con código {data['pro_codigo']}")

# Obtenemos el programa de Sistemas para usarlo en estudiantes
programa_sistemas = Programa.objects.get(pro_codigo="SIS001")


# --- 3. CREACIÓN DE ESTUDIANTES ---
codigos = [
    104621011351, 100621021344, 104621011382, 104621011377, 
    100621021365, 100621021349, 104621011376, 104621011383, 
    104621021199
]

estudiantes_creados = 0
for codigo in codigos:
    estudiante, created_est = Estudiante.objects.get_or_create(
        est_codigo=codigo,
        defaults={
            'est_nombre': f"Nombre{codigo}", 
            'est_apellido': f"Apellido{codigo}", 
            'est_correo': f"correo{codigo}@unicauca.edu.co",
            'pro_codigo_id': programa_sistemas.pro_codigo
        }
    )
    if created_est:
        estudiantes_creados += 1

print(f"{estudiantes_creados} estudiantes creados o actualizados con éxito")

EOF

# Ejecuta el servidor de Django (u otro comando que pases)
exec "$@"