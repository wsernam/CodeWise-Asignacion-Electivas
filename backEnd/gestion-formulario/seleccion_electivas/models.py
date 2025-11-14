from datetime import date
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
        'gestion_estudiantes.Estudiante', 
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
        # Un estudiante no puede seleccionar la misma electiva dos veces en el mismo periodo.
        unique_together = [
            ('sel_anio', 'sel_num_semestre', 'est_codigo', 'ele_codigo'),
            # Un estudiante no puede tener la misma prioridad dos veces en el mismo periodo.
            ('sel_anio', 'sel_num_semestre', 'est_codigo', 'sel_prioridad'),
        ]

        constraints = [
            # sel_anio no puede ser inferior al año actual
            models.CheckConstraint(
                check=models.Q(sel_anio__gte=date.today().year),
                name='sel_anio_no_inferior_anio_actual'
            ),
            # sel_prioridad debe ser mayor a 0
            models.CheckConstraint(
                check=models.Q(sel_prioridad__gt=0),
                name='sel_prioridad_mayor_que_cero'
            ),
        ]

    def __str__(self):
        # Usamos self.est_codigo y self.ele_codigo que son los objetos relacionados
        # para poder acceder a sus campos, como el nombre.
        # El _id al final (e.g., self.est_codigo_id) solo te da el valor de la clave foránea.
        return f"Selección de {self.est_codigo} - {self.ele_codigo} (Prioridad {self.sel_prioridad})"
