from django.db import models


class Programa(models.Model):
    pro_codigo = models.AutoField(primary_key=True)
    pro_nombre = models.CharField(max_length=150, unique=True)
    fac_codigo = models.IntegerField()
    pro_activo = models.BooleanField(default=True)  # True=activo, False=inactivo

    def __str__(self):
        return self.pro_nombre


class Estudiante(models.Model):
    est_codigo = models.AutoField(primary_key=True)
    est_nombre = models.CharField(max_length=120)
    est_apellido = models.CharField(max_length=120)
    est_correo = models.EmailField(max_length=254, unique=True)
    pro_codigo = models.ForeignKey("Programa", on_delete=models.PROTECT, related_name="estudiantes")

    def __str__(self):
        return f"{self.est_nombre} {self.est_apellido}"


class Electiva(models.Model):
    ele_codigo = models.AutoField(primary_key=True)
    ele_nombre = models.CharField(max_length=150, unique=True)
    pro_codigo = models.ForeignKey("Programa", on_delete=models.PROTECT, related_name="electivas")
    ele_estado = models.BooleanField(default=True)  # True=activo, False=inactivo

    def __str__(self):
        return f"{self.ele_nombre} ({'Activa' if self.ele_estado else 'Inactiva'})"
