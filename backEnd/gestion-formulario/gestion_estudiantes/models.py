from django.db import models
from gestion_electivas.models import Programa

class Estudiante(models.Model):
    est_codigo = models.BigIntegerField(primary_key=True)
    est_nombre   = models.CharField(max_length=120)
    est_apellido = models.CharField(max_length=120)
    est_correo   = models.EmailField(max_length=254, unique=True)
    pro_codigo   = models.ForeignKey(Programa, on_delete=models.PROTECT, related_name="estudiantes")

    def __str__(self):
        return f"{self.est_nombre} {self.est_apellido}"