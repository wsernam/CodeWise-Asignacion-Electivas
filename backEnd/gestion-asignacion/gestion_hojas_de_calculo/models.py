# inventario/models.py

from django.db import models
from django.utils import timezone
# Importamos el modelo Estudiante desde su ubicación real (simulada aquí)
from referencias.models import Estudiante 

class PerfilAcademico(models.Model):
    # Clave primaria generada automáticamente
    perfil_codigo = models.AutoField(primary_key=True) 
    
    # Clave Foránea al estudiante. Un estudiante puede tener múltiples perfiles 
    # (uno por período académico).
    est_codigo = models.ForeignKey(
        Estudiante, 
        on_delete=models.CASCADE, 
        related_name="perfiles_academicos" # Cambiado a plural
    )

    # Campos que se llenarán con el Excel (mapeo directo)
    promedio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    num_electivas_cursadas = models.IntegerField(default=0)
    creditos_aprob_total = models.IntegerField(max_digits=10, decimal_places=2, default=0)
    num_periodos_matriculados = models.IntegerField(default=0)
    
    # Campos con valores por defecto/calculados/fijos (se definen en el Resource)
    nivelado = models.BooleanField(default=False) # Por defecto no está nivelado
    porcentaje_avance = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    creditos_aprob_oblig = models.IntegerField(default=0)
    # >>> CAMBIO AQUÍ: Por defecto es False
    estado = models.BooleanField(default=False) 
    perfil_anio = models.IntegerField(default=timezone.now().year)
    perfil_semestre = models.IntegerField(default=1) # Asumimos 1 o 2

    def __str__(self):
        return f"Perfil de {self.est_codigo.est_nombre} - {self.perfil_anio}/{self.perfil_semestre}"
        
    class Meta:
        verbose_name = "Perfil Académico"
        verbose_name_plural = "Perfiles Académicos"
        # Restricción de unicidad para asegurar que un estudiante solo tenga un perfil 
        # por año y semestre.
        unique_together = ('est_codigo', 'perfil_anio', 'perfil_semestre')
