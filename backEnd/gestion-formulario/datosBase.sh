#!/bin/bash
sed -i 's/\r$//' "$0"

echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Insertando datos iniciales en la base de datos..."

python manage.py shell <<EOF
from gestion_electivas.models import Programa, Facultad, Electiva
from gestion_estudiantes.models import Estudiante
from gestion_oferta_electiva.models import Oferta_electiva
from seleccion_electivas.models import SeleccionEstudianteElectiva
from datetime import date

print("--- 1. CREANDO FACULTAD ---")
# --- 1. CREACIÓN DE FACULTAD ---
facultad, created_fac = Facultad.objects.get_or_create(
    fac_nombre="Facultad de Ingeniería"
)
print(f"Facultad creada: {created_fac}, código asignado: {facultad.fac_codigo}")

print("\n--- 2. CREANDO PROGRAMAS ---")
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

Programa.objects.get_or_create(
    pro_nombre="Ingenieria Automatica",
    defaults={'fac_codigo': facultad}
)

Programa.objects.get_or_create(
    pro_nombre="Ingenieria Electronica",
    defaults={'fac_codigo': facultad}
)

print("3 programas creados o actualizados.")

print("\n--- 3. CREANDO ELECTIVAS ---")
electiva1, _ = Electiva.objects.get_or_create(
    ele_nombre="Inteligencia Artificial",
    defaults={'pro_codigo': programa_sistemas}
)
electiva2, _ = Electiva.objects.get_or_create(
    ele_nombre="Desarrollo Web Avanzado",
    defaults={'pro_codigo': programa_sistemas}
)
electiva3, _ = Electiva.objects.get_or_create(
    ele_nombre="Computación en la Nube",
    defaults={'pro_codigo': programa_sistemas}
)
print("3 electivas creadas o actualizadas.")

print("\n--- 4. CREANDO OFERTA DE ELECTIVAS ---")
anio_actual = date.today().year
semestre_actual = 1
electivas_ofertadas = [electiva1, electiva2, electiva3]
ofertas_creadas = 0

for electiva in electivas_ofertadas:
    _, created = Oferta_electiva.objects.get_or_create(
        ofe_anio=anio_actual,
        ofe_num_semestre=semestre_actual,
        ele_codigo=electiva,
        pro_codigo=programa_sistemas
    )
    if created:
        ofertas_creadas += 1

print(f"{ofertas_creadas} nuevas ofertas creadas para el periodo {anio_actual}-{semestre_actual}.")

print("\n--- 5. CREANDO ESTUDIANTES Y SU SELECCIÓN DE ELECTIVAS ---")

# --- 5. CREACIÓN DE ESTUDIANTES Y SU SELECCIÓN ---

# Lista de códigos de estudiantes
codigos = [
    104621011351, 100621021344, 104621011382, 104621011377, 
    100621021365, 100621021349, 104621011376, 104621011383, 
    104621021199
]

estudiantes_creados = 0
selecciones_creadas = 0
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

    # Por cada estudiante, creamos su selección de electivas para el periodo actual
    # Seleccionará la electiva 1 como prioridad 1 y la electiva 2 como prioridad 2
    # --- AJUSTE PARA ROBUSTEZ ---
    # Usamos get_or_create con todos los campos que definen la unicidad para evitar errores.
    # Esto asegura que no se intente crear una selección si ya existe una con la misma
    # electiva o la misma prioridad para ese estudiante en ese periodo.

    # Selección para Prioridad 1
    obj, created = SeleccionEstudianteElectiva.objects.get_or_create(
        est_codigo=estudiante,
        sel_anio=anio_actual,
        sel_num_semestre=semestre_actual,
        sel_prioridad=1,
        defaults={
            'ele_codigo': electiva1
        }
    )
    if created:
        selecciones_creadas += 1

    # Selección para Prioridad 2
    obj, created = SeleccionEstudianteElectiva.objects.get_or_create(
        est_codigo=estudiante,
        sel_anio=anio_actual,
        sel_num_semestre=semestre_actual,
        sel_prioridad=2,
        defaults={
            'ele_codigo': electiva2
        }
    )
    if created:
        selecciones_creadas += 1



print(f"{estudiantes_creados} nuevos estudiantes creados.")
print(f"{selecciones_creadas} nuevas selecciones de electivas creadas.")

EOF

# Ejecuta el servidor de Django (u otro comando que pases)
exec "$@"