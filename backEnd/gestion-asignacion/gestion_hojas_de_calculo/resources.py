# inventario/resources.py

from import_export import resources, fields
from .models import PerfilAcademico
from referencias.models import Estudiante
from import_export.widgets import DecimalWidget, IntegerWidget, ForeignKeyWidget
from decimal import Decimal, InvalidOperation
from datetime import date
from django.db import transaction
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

# Widget personalizado para limpiar los valores Decimales
class CustomDecimalWidget(DecimalWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if isinstance(value, str):
            value = value.replace('$', '').replace(',', '').strip()
        if isinstance(value, str) and ',' in value and '.' not in value:
             value = value.replace(',', '.')
        return super().clean(value, row, *args, **kwargs)

class CustomForeignKeyWidget(ForeignKeyWidget):
    """
    Widget personalizado que mejora el manejo de errores para claves foráneas.
    """
    def clean(self, value, row=None, *args, **kwargs):
        logger.info(f"ForeignKeyWidget.clean - Fila: {row} | Valor inicial: '{value}' (Tipo: {type(value)})")

        if not value:
            return None
        
        try:
            str_value = str(value)
            if str_value.endswith('.0'):
                str_value = str_value[:-2]
            int_value = int(str_value)
            logger.info(f"ForeignKeyWidget.clean - Fila: {row} | Valor convertido a int: {int_value} (Tipo: {type(int_value)})")
        except (ValueError, TypeError):
            raise ValueError(f"La celda contiene texto no válido ('{value}'). Asegúrate de eliminar pies de página o texto innecesario del archivo Excel.")

        try:
            logger.info(f"ForeignKeyWidget.clean - Fila: {row} | Buscando en DB con: {self.field}={int_value}")
            return self.get_queryset(value, row, *args, **kwargs).get(**{self.field: int_value})
        except self.model.DoesNotExist:
            raise ValueError(f"No se encontró un '{self.model._meta.verbose_name}' con el código '{int_value}'.")


class PerfilAcademicoResource(resources.ModelResource):
    """
    Resource para importar datos de Excel hacia el modelo PerfilAcademico.
    """
    
    # Mapeo de columnas del Excel a campos del modelo
    est_codigo = fields.Field(
        column_name='CODIGO',
        attribute='est_codigo',
        widget=ForeignKeyWidget(Estudiante, field='est_codigo')
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
        import_id_fields = ('est_codigo',)
        fields = (
            'est_codigo', 
            'promedio', 
            'num_electivas_cursadas', 
            'creditos_aprob_total',
            'num_periodos_matriculados',
            'nivelado',
            'porcentaje_avance',
            'estado',
            'perfil_anio',
            'perfil_semestre'
        )
        formats = ['xlsx', 'xls']

    def before_import_row(self, row, **kwargs):
        """
        Se ejecuta antes de importar cada fila.
        Aquí obtenemos el periodo activo y lo asignamos a la fila.
        """
        anio_activo = kwargs.get('anio_activo')
        semestre_activo = kwargs.get('semestre_activo')
        
        if anio_activo is None or semestre_activo is None:
            anio_activo = timezone.now().year
            semestre_activo = 1
        
        row['perfil_anio'] = anio_activo
        row['perfil_semestre'] = semestre_activo
        
        return super().before_import_row(row, **kwargs)

    def before_save_instance(self, instance, row, **kwargs):
        """
        Se ejecuta justo antes de guardar cada instancia.
        Aquí calculamos campos derivados con validación robusta de tipos.
        """
        # FUNCIÓN AUXILIAR: Convertir a número de forma segura
        def to_number(value, tipo='int'):
            """
            Convierte un valor a número de forma segura.
            Retorna None si no se puede convertir.
            """
            if value is None:
                return None
            
            # Si ya es del tipo correcto, devolverlo
            if tipo == 'int' and isinstance(value, int):
                return value
            if tipo == 'decimal' and isinstance(value, Decimal):
                return value
            if tipo == 'float' and isinstance(value, float):
                return value
            
            # Intentar convertir
            try:
                # Si es string, limpiar espacios
                if isinstance(value, str):
                    value = value.strip()
                    if value == '':
                        return None
                
                if tipo == 'int':
                    return int(float(value))  # float primero para manejar '10.0'
                elif tipo == 'decimal':
                    return Decimal(str(value))
                elif tipo == 'float':
                    return float(value)
            except (ValueError, TypeError, InvalidOperation):
                return None
        
        # Convertir campos numéricos de forma segura
        if instance.creditos_aprob_total is not None:
            instance.creditos_aprob_total = to_number(instance.creditos_aprob_total, 'int')
        
        if instance.num_electivas_cursadas is not None:
            instance.num_electivas_cursadas = to_number(instance.num_electivas_cursadas, 'int')
        
        if instance.num_periodos_matriculados is not None:
            instance.num_periodos_matriculados = to_number(instance.num_periodos_matriculados, 'int')
        
        if instance.promedio is not None:
            instance.promedio = to_number(instance.promedio, 'decimal')
        
        # Calcular porcentaje de avance (sobre 174 créditos totales)
        creditos_totales_programa = 174
        
        if instance.creditos_aprob_total is not None and creditos_totales_programa > 0:
            try:
                instance.porcentaje_avance = (
                    Decimal(instance.creditos_aprob_total) / Decimal(creditos_totales_programa)
                ) * Decimal(100)
            except (ValueError, TypeError, InvalidOperation):
                instance.porcentaje_avance = Decimal(0)
        else:
            instance.porcentaje_avance = Decimal(0)
        
        # Determinar si está nivelado (más de 4 períodos matriculados)
        if instance.num_periodos_matriculados is not None:
            try:
                instance.nivelado = int(instance.num_periodos_matriculados) > 4
            except (ValueError, TypeError):
                instance.nivelado = False
        else:
            instance.nivelado = False
        
        # Estado: True = Activo
        instance.estado = True
        
        return super().before_save_instance(instance, row, **kwargs)