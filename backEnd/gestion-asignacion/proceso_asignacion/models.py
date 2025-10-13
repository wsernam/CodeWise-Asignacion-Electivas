from django.db import models

class ProcesoAsignacion(models.Model):
    class Estado(models.TextChoices):
        EN_CURSO = "EN_CURSO"
        BORRADOR = "BORRADOR"  

    usuario_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    paso_actual = models.PositiveSmallIntegerField(default=1)
    datos_temporales = models.JSONField(default=dict, blank=True)
    estado = models.CharField(max_length=12, choices=Estado.choices, default=Estado.EN_CURSO)

    fecha_actualizacion = models.DateTimeField(auto_now=True)
    creado_en = models.DateTimeField(auto_now_add=True)


