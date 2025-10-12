from django.db import models

class Facultad(models.Model):
    fac_codigo = models.AutoField(primary_key=True)
    fac_nombre = models.CharField(max_length=120, unique=True)

    def __str__(self):
        return self.fac_nombre



class Programa(models.Model):
    pro_codigo = models.CharField(max_length=1000, primary_key=True)
    pro_nombre = models.CharField(max_length=150, unique=True)
    fac_codigo = models.ForeignKey(Facultad, on_delete=models.CASCADE, related_name="programas")
    pro_activo = models.BooleanField(default=True)  # True=activo, False=inactivo
    def __str__(self):
        return self.pro_nombre


class Electiva(models.Model):
    ele_codigo = models.CharField(max_length=1000, primary_key=True)
    ele_nombre = models.CharField(max_length=150, unique=True)
    pro_codigo = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name="electivas")
    ele_estado = models.BooleanField(default=True)  # True = activo (1), False = inactivo (0)

    def __str__(self):
        return f"{self.ele_nombre} ({'Activa' if self.ele_estado else 'Inactiva'})"

