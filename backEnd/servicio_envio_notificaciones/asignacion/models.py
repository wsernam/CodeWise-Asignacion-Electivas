from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from referencias.models import Estudiante, Electiva

class Asignacion(models.Model):
    # Enumeración para el número de semestre (1 o 2).
    # Usar IntegerChoices te da validación + etiquetas legibles en admin/forms.
    class NumSemestre(models.IntegerChoices):
        UNO = 1, "1"
        DOS = 2, "2"

    # PK autoincremental grande (útil si esperas muchas filas).
    id_asignacion = models.BigAutoField(primary_key=True)

    # Año académico con validaciones mín/máx; index para filtrar rápido por período.
    anio = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        db_index=True
    )

    # Semestre (1 o 2) con choices; index para acelerar consultas por período.
    asi_num_semestre = models.PositiveSmallIntegerField(
        choices=NumSemestre.choices,
        db_index=True
    )

    # FK al estudiante: PROTECT evita borrar un estudiante con asignaciones existentes.
    # related_name permite est.asignaciones.all()
    est_codigo = models.ForeignKey(
        Estudiante,
        on_delete=models.PROTECT,
        related_name="asignaciones",
        db_column="est_codigo",
    )

    # FK a electiva: PROTECT evita borrar electivas con asignaciones.
    ele_codigo = models.ForeignKey(
        Electiva,
        on_delete=models.PROTECT,
        related_name="asignaciones",
        db_column="ele_codigo",
    )

    # Flag para diferenciar cupo firme vs lista de espera; index para reportes/consultas mixtas.
    en_lista_espera = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = "asignacion"  # nombre explícito en la DB (útil si hay legacy)
        constraints = [
            # Garantiza que un estudiante no se repita en la MISMA electiva y período.
            # (anio, semestre, est, ele) debe ser único.
            models.UniqueConstraint(
                fields=["anio", "asi_num_semestre", "est_codigo", "ele_codigo"],
                name="uniq_asignacion_periodo_est_elec",
            ),
        ]
        indexes = [
            # Índices auxiliares para consultas por estudiante o electiva.
            models.Index(fields=["est_codigo"], name="idx_asig_est"),
            models.Index(fields=["ele_codigo"], name="idx_asig_elec"),
            models.Index(fields=["en_lista_espera"], name="idx_asig_espera"),
        ]
        # Sugerible (opcional): orden natural por período.
        # ordering = ["-anio", "-asi_num_semestre", "est_codigo_id"]

    def __str__(self):
        # Representación legible: 2025-2 · 123456 · ELE-101
        return f"{self.anio}-{self.asi_num_semestre} · {self.est_codigo_id} · {self.ele_codigo_id}"
