from django.db import models
from gestion_electivas.models import Electiva, Programa  # Importamos los modelos ya existentes
                                                     # porque los necesitamos como ForeignKey


class Oferta_electiva(models.Model):
    # Clave primaria autoincremental
    ofe_codigo = models.AutoField(primary_key=True)

    # Año de la oferta (ejemplo: 2025, 2026...)
    ofe_anio = models.PositiveIntegerField()

    # Semestre en el que se ofrece
    # choices: limita los valores posibles (1 = Primer semestre, 2 = Segundo semestre)
    ofe_num_semestre = models.PositiveSmallIntegerField(
        choices=[(1, "I"), (2, "II")]
    )
    
    # Relación con Electiva
    # Si se elimina la electiva, también se eliminan las ofertas (on_delete=models.CASCADE)
    # related_name="ofertas" permite acceder desde Electiva a sus ofertas con .ofertas.all()
    ele_codigo = models.ForeignKey(
        Electiva,
        on_delete=models.CASCADE,
        related_name="ofertas"
    )

    # Relación con Programa
    # Si se elimina el programa, también se eliminan sus ofertas
    # related_name="ofertas" permite acceder desde Programa a sus ofertas con .ofertas.all()
    pro_codigo = models.ForeignKey(
        Programa,
        on_delete=models.CASCADE,
        related_name="ofertas"
    )

    class Meta:
        # Restricciones y configuraciones adicionales de la tabla
        constraints = [
            # UniqueConstraint: asegura que NO se repita la misma combinación
            # de (año + semestre + electiva + programa)
            models.UniqueConstraint(
                fields=["ofe_anio", "ofe_num_semestre", "ele_codigo", "pro_codigo"],
                name="unique_oferta_electiva"
            )
        ]
        # Orden por defecto al hacer consultas: primero años más recientes,
        # y dentro de cada año, semestre más reciente
        ordering = ["-ofe_anio", "-ofe_num_semestre"]

    def __str__(self):
        # Representación en texto del objeto (muy útil en el admin y en prints)
        # Ejemplo: "Electiva X - Programa Y (2025-1)"
        return f"{self.ele_codigo.ele_nombre} - {self.pro_codigo.pro_nombre} ({self.ofe_anio}-{self.ofe_num_semestre})"
