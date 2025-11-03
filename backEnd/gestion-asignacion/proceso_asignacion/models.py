from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class ProcesoAsignacion(models.Model):
    class PasoActual(models.IntegerChoices):
        CREADO               = 1, "creado"
        ARCHIVOS_GUARDADOS   = 2, "archivos-guardados"
        NIVELADOS_GESTIONADOS= 4, "nivelados-gestionados"
        ASIGNACION_REALIZADA = 5, "asignacion-realizada"
        FINALIZADO           = 6, "finalizado"

    class Estado(models.IntegerChoices):
        ACTIVO   = 1, "activo"
        INACTIVO = 2, "inactivo"

    # PK (por defecto AutoField); nombre lógico del diagrama: pa_codigo
    
    pa_codigo = models.AutoField(primary_key=True)

    pa_paso_actual = models.PositiveSmallIntegerField(
        choices=PasoActual.choices,
        default=PasoActual.CREADO,
        help_text="1=creado, 2=archivos-guardados, 4=nivelados-gestionados, 5=asignacion-realizada, 6=finalizado",
    )
    pa_anio = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        help_text="Ej: 2025",
    )
    pa_num_semestre = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(2)],
        help_text="1 ó 2",
    )

    pa_fecha_creacion = models.DateTimeField(auto_now_add=True)
    pa_ultima_fecha_actualizacion = models.DateTimeField(auto_now=True)

    pa_estado = models.PositiveSmallIntegerField(
        choices=Estado.choices,
        default=Estado.ACTIVO,
        help_text="1=activo, 2=inactivo",
    )

    class Meta:
        constraints = [
            # Un único registro con pa_estado = ACTIVO (1)
            models.UniqueConstraint(
                fields=["pa_estado"],
                condition=models.Q(pa_estado=1),
                name="uniq_un_proceso_activo_global",
            ),
            models.UniqueConstraint(
                fields=["pa_anio", "pa_num_semestre"],
                name="uniq_proceso_por_anio_semestre",
            ),
        ]
        ordering = ["-pa_fecha_creacion"]

    def __str__(self):
        return f"{self.pa_anio}-{self.pa_num_semestre} · {self.get_pa_estado_display()} · paso {self.pa_paso_actual}"
