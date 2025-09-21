#!/bin/bash

echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Insertando datos iniciales en la base de datos..."

python manage.py shell <<EOF
from gestion_electivas.models import Facultad, Programa
from seleccion_electivas.models import Estudiante

# Crear Facultades
fac1, created = Facultad.objects.get_or_create(fac_nombre="Facultad de Ingenieria Civil")
fac2, created = Facultad.objects.get_or_create(fac_nombre="Facultad de Ingenieria Electrica y Telecomunicaciones")

print("2  Facultades creadas")
# Crear Programas asociados a la segunda facultad
Programa.objects.get_or_create(pro_nombre="Ingenieria en Sistemas", fac_codigo=fac2)
Programa.objects.get_or_create(pro_nombre="Ingenieria Automatica", fac_codigo=fac2)
Programa.objects.get_or_create(pro_nombre="Ingenieria Electronica", fac_codigo=fac2)

print("3 programas creados")
# Crear un estudiante
est = Estudiante(
    est_nombre="Ashlee",
    est_apellido="Campaz",
    pro_codigo="1",
    est_correo="ashleecampaz@unicauca.edu.co"
)
est.save()

print("✅ Estudiante Ashlee Campaz creado con éxito")

EOF

# Ejecuta el servidor de Django
exec "$@"
