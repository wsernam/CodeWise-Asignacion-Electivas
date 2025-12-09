# inventario/resources.py

from import_export import resources, fields
from .models import PerfilAcademico
from referencias.models import Estudiante
from import_export.widgets import DecimalWidget, IntegerWidget, ForeignKeyWidget
from decimal import Decimal, InvalidOperation
from datetime import date
from django.db import transaction # Necesario para guardar dentro del after_save
import logging

# Obtenemos una instancia del logger para imprimir en la consola de Django
logger = logging.getLogger(__name__)

# Widget personalizado para limpiar los valores Decimales
class CustomDecimalWidget(DecimalWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if isinstance(value, str):
            value = value.replace('$', '').replace(',', '').strip()
        # Intentamos reemplazar la coma decimal por punto si viene en formato ES/LATAM
        if isinstance(value, str) and ',' in value and '.' not in value:
             value = value.replace(',', '.')
        return super().clean(value, row, *args, **kwargs)

class CustomForeignKeyWidget(ForeignKeyWidget):
    """
    Widget personalizado que mejora el manejo de errores para claves foráneas.
    1. Ignora valores no numéricos (como texto de pie de página).
    2. Proporciona un mensaje de error claro si el objeto no se encuentra.
    """
    def clean(self, value, row=None, *args, **kwargs):
        # --- LOGGING ---
        logger.info(f"ForeignKeyWidget.clean - Fila: {row} | Valor inicial: '{value}' (Tipo: {type(value)})")

        if not value:
            return None
        # Si el valor no es un número, lo tratamos como nulo para que skip_row lo ignore.
        # CORRECCIÓN: Convertimos a string primero para evitar la imprecisión de los float.
        # Esto asegura que números grandes como '104621011351.0' se conviertan correctamente.
        try:
            # CORRECCIÓN: Manejar el caso de que el valor sea un float con '.0'
            # Lo convertimos a string, quitamos el '.0' si existe, y luego a int.
            # Esto es más directo y evita la doble conversión con Decimal.
            str_value = str(value)
            if str_value.endswith('.0'):
                str_value = str_value[:-2]
            int_value = int(str_value)
            # --- LOGGING ---
            logger.info(f"ForeignKeyWidget.clean - Fila: {row} | Valor convertido a int: {int_value} (Tipo: {type(int_value)})")
        except (ValueError, TypeError):
            # Si el valor no se puede convertir a número (ej: es texto como el pie de página),
            # lanzamos un error claro en lugar de devolver None.
            raise ValueError(f"La celda contiene texto no válido ('{value}'). Asegúrate de eliminar pies de página o texto innecesario del archivo Excel.")

        try:
            # Usamos el método de la clase padre para buscar el objeto
            # --- LOGGING ---
            logger.info(f"ForeignKeyWidget.clean - Fila: {row} | Buscando en DB con: {self.field}={int_value}")
            return self.get_queryset(value, row, *args, **kwargs).get(**{self.field: int_value})
        except self.model.DoesNotExist:
            # Lanzamos un error claro que será capturado y mostrado al usuario.
            raise ValueError(f"No se encontró un '{self.model._meta.verbose_name}' con el código '{int_value}'.")

# inventario/resources.py

from import_export import resources, fields, widgets
from .models import PerfilAcademico
from referencias.models import Estudiante
from decimal import Decimal
from django.utils import timezone

# inventario/resources.py

from import_export import resources, fields, widgets
from .models import PerfilAcademico
from referencias.models import Estudiante
from decimal import Decimal
from django.utils import timezone

class PerfilAcademicoResource(resources.ModelResource):
    """
    Resource para importar datos de Excel hacia el modelo PerfilAcademico.
    """
    
    # Mapeo de columnas del Excel a campos del modelo
    est_codigo = fields.Field(
        column_name='CODIGO',
        attribute='est_codigo',
        widget=widgets.ForeignKeyWidget(Estudiante, field='est_codigo')
    )
    
    promedio = fields.Field(
        column_name='PROMEDIO_CARRERA',
        attribute='promedio'
    )
    
    num_electivas_cursadas = fields.Field(
        column_name='APROBADAS',
        attribute='num_electivas_cursadas'
    )
    
    creditos_aprob_total = fields.Field(
        column_name='CREDITOS_APROBADOS',
        attribute='creditos_aprob_total'
    )
    
    num_periodos_matriculados = fields.Field(
        column_name='PERIODOS_MATRICULADOS',
        attribute='num_periodos_matriculados'
    )

    class Meta:
        model = PerfilAcademico
        skip_unchanged = True
        report_skipped = False
        import_id_fields = ['est_codigo', 'perfil_anio', 'perfil_semestre']
        fields = (
            'est_codigo', 
            'promedio', 
            'num_electivas_cursadas', 
            'creditos_aprob_total',
            'num_periodos_matriculados',
            'perfil_anio',
            'perfil_semestre'
        )

    def before_import_row(self, row, **kwargs):
        """
        Se ejecuta antes de importar cada fila.
        Aquí obtenemos el periodo activo y lo asignamos a la fila.
        """
        # Obtener el periodo del contexto pasado desde la vista
        anio_activo = kwargs.get('anio_activo')
        semestre_activo = kwargs.get('semestre_activo')
        
        # Si no se proporcionaron, usar valores por defecto (no debería ocurrir)
        if anio_activo is None or semestre_activo is None:
            anio_activo = timezone.now().year
            semestre_activo = 1
        
        # Asignar los valores del periodo a la fila
        row['perfil_anio'] = anio_activo
        row['perfil_semestre'] = semestre_activo
        
        return super().before_import_row(row, **kwargs)

    def before_save_instance(self, instance, row, **kwargs):
        """
        Se ejecuta justo antes de guardar cada instancia.
        Aquí calculamos campos derivados.
        """
        # Calcular porcentaje de avance (ejemplo: sobre 174 créditos totales)
        creditos_totales_programa = 174
        if instance.creditos_aprob_total and creditos_totales_programa > 0:
            instance.porcentaje_avance = (
                Decimal(instance.creditos_aprob_total) / Decimal(creditos_totales_programa)
            ) * Decimal(100)
        else:
            instance.porcentaje_avance = Decimal(0)
        
        # Determinar si está nivelado (ejemplo: más de 4 períodos matriculados)
        instance.nivelado = instance.num_periodos_matriculados > 4
        
        # Estado: True = Activo
        instance.estado = True
        
        return super().before_save_instance(instance, row, **kwargs)

    class Meta:
        model = PerfilAcademico
        
        # CAMBIO CLAVE: La identificación se basa solo en el FK que el widget resuelve.
        # La lógica de año/semestre se maneja en get_or_init_instance.
        import_id_fields = ('est_codigo',)
        
        # Incluimos explícitamente todos los campos del modelo (excepto la PK)
        fields = (
            'est_codigo', 
            'promedio', 
            'num_electivas_cursadas', 
            'creditos_aprob_total', 
            'num_periodos_matriculados', 
            'nivelado',
            'porcentaje_avance',
            'estado', # Incluido para que el framework sepa que existe, pero el valor
                      # viene por defecto (False) y lo actualizamos en after_save_instance
            'perfil_anio',
            'perfil_semestre'
        ) 

        skip_unchanged = True
        report_skipped = True
        formats = ['xlsx', 'xls']
