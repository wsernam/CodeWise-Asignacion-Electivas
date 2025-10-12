from django.db import models

class SeleccionEstudianteElectiva(models.Model):
    SEMESTRE_CHOICES = (
        (1, 'Primer semestre'),
        (2, 'Segundo semestre'),
    )

    sel_codigo = models.AutoField(primary_key=True)
    sel_anio = models.IntegerField()
    sel_num_semestre = models.IntegerField(choices=SEMESTRE_CHOICES)
    sel_prioridad = models.IntegerField()

    # Foreign Keys
    est_codigo = models.ForeignKey(
        'gestion_estudiantes.Estudiante', # <-- APUNTAR AL MODELO CORRECTO
        on_delete=models.CASCADE,
        db_column='est_codigo'
    )
    ele_codigo = models.ForeignKey(
        'gestion_electivas.Electiva',
        on_delete=models.CASCADE,
        db_column='ele_codigo'
    )

    class Meta:
        db_table = 'Seleccion_estudiante_electiva'
        unique_together = (
            'sel_anio',
            'sel_num_semestre',
            'est_codigo',
            'ele_codigo',
            'sel_prioridad'
        )


    def __str__(self):
        return f"Selección {self.sel_codigo} - Estudiante {self.est_codigo_id} - Electiva {self.ele_codigo_id}"
