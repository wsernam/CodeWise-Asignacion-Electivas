#!/bin/bash

echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Insertando datos iniciales en la base de datos..."

python manage.py shell <<EOF
from gestion_electivas.models import Facultad, Programa

# Crear Facultades
fac1, created = Facultad.objects.get_or_create(fac_nombre="Facultad de Ingenieria Civil")
fac2, created = Facultad.objects.get_or_create(fac_nombre="Facultad de Ingenieria Electrica y Telecomunicaciones")

# Crear Programas asociados a la segunda facultad
Programa.objects.get_or_create(pro_nombre="Ingenieria en Sistemas", fac_codigo=fac2)
Programa.objects.get_or_create(pro_nombre="Ingenieria Automatica", fac_codigo=fac2)
Programa.objects.get_or_create(pro_nombre="Ingenieria Electronica", fac_codigo=fac2)

print("Datos insertados correctamente")
EOF

# Ejecuta el servidor de Django
exec "$@"
