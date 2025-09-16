from django.db import models

class Formulario(models.Model):
    """
    Modelo para gestionar el estado de un formulario.
    """
    estado = models.BooleanField(default=False)

    def __str__(self):
        return f"Estado del Formulario: {'Activo' if self.estado else 'Inactivo'}"