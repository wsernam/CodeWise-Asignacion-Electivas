from django.db import models



class Programa(models.Model):
    pro_codigo = models.CharField(max_length=225, primary_key=True)
    pro_nombre = models.CharField(max_length=150, unique=True)
    fac_codigo = models.IntegerField()
    pro_activo = models.BooleanField(default=True)  # True=activo, False=inactivo

    def __str__(self):
        return self.pro_nombre



class Estudiante(models.Model):
    # CAMBIO: Se ajusta a IntegerField para coincidir con el modelo original.
    est_codigo = models.BigIntegerField(primary_key=True)
    est_nombre = models.CharField(max_length=120)
    est_apellido = models.CharField(max_length=120)
    est_correo = models.EmailField(max_length=254, unique=True)
    pro_codigo = models.ForeignKey("Programa", on_delete=models.PROTECT, related_name="estudiantes")

    def __str__(self):
        return f"{self.est_nombre} {self.est_apellido}"


class Electiva(models.Model):
    ele_codigo = models.CharField(max_length=225, primary_key=True)
    ele_nombre = models.CharField(max_length=150, unique=True)
    pro_codigo = models.ForeignKey("Programa", on_delete=models.PROTECT, related_name="electivas")
    ele_estado = models.BooleanField(default=True)  # True=activo, False=inactivo

    def __str__(self):
        return f"{self.ele_nombre} ({'Activa' if self.ele_estado else 'Inactiva'})"

class Oferta(models.Model):
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
                name="unique_oferta_asignacion"
            )
        ]
        # Orden por defecto al hacer consultas: primero años más recientes,
        # y dentro de cada año, semestre más reciente
        ordering = ["-ofe_anio", "-ofe_num_semestre"]

    def __str__(self):
        # Representación en texto del objeto (muy útil en el admin y en prints)
        # Ejemplo: "Electiva X - Programa Y (2025-1)"
        return f"{self.ele_codigo.ele_nombre} - {self.pro_codigo.pro_nombre} ({self.ofe_anio}-{self.ofe_num_semestre})"

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
    est_codigo = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    ele_codigo = models.ForeignKey(Electiva, on_delete=models.CASCADE)

    class Meta:
        db_table = 'Seleccion_estudiante_electiva'
        unique_together = (
            'sel_anio',
            'sel_num_semestre',
            'est_codigo',
            'ele_codigo',
            'sel_prioridad'
        )
        ordering = ['est_codigo', 'sel_prioridad']


    def __str__(self):
        return f"Selección {self.sel_codigo} - Estudiante {self.est_codigo_id} - Prioridad {self.sel_prioridad}"
