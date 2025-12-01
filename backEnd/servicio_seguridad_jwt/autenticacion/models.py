from django.db import models
from django.contrib.auth.models import AbstractUser

# Modelo personalizado de usuario que extiende el modelo base AbstractUser de Django
# Permite agregar campos adicionales al sistema de autenticación, como el rol del usuario
class User(AbstractUser):
    # Definición de los roles disponibles en la plataforma
    # Cada tupla contiene: (valor almacenado en la base de datos, etiqueta legible para el administrador)
    ROLE_CHOICES = (
        ('Asignador', 'Asignador'),         # Usuario encargado de asignar tareas o recursos
        ('Administrador', 'Administrador'),  # Usuario que Administra electivas
        ('Ambos', 'Ambos')  # Usuario con todos los privilegios
    )

    # Campo adicional que define el rol del usuario dentro de la aplicación
    # Se almacena como texto, limitado a 20 caracteres, y debe coincidir con una de las opciones definidas en ROLE_CHOICES
    # El valor por defecto es 'Asignador'
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='Asignador'
    )