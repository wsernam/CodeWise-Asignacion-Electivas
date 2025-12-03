#!/bin/bash

# Aplica las migraciones de la base de datos
python manage.py migrate

# Crea el superusuario de forma no interactiva (opcional, pero útil)
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin_password')" | python manage.py shell

# Crea los usuarios específicos: Asignador y Administrador
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
# Verifica si el usuario 'Asignador' ya existe antes de crearlo
if not User.objects.filter(username='asignador').exists():
    user = User.objects.create_user(username='asignador', password='contraseña_asignador', email='asignador@example.com', role='Asignador')
    print("Usuario 'asignador' creado.")
else:
    print("El usuario 'asignador' ya existe.")

# Verifica si el usuario 'Administrador' ya existe antes de crearlo
if not User.objects.filter(username='administrador').exists():
    user = User.objects.create_user(username='administrador', password='contraseña_administrador', email='administrador@example.com', role='Administrador')
    print("Usuario 'administrador' creado.")
else:
    print("El usuario 'administrador' ya existe.")
EOF

# Ejecuta el servidor de Django
exec "$@"
