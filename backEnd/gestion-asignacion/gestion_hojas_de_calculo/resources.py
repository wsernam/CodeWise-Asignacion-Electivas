# inventario/resources.py

from import_export import resources, fields
from .models import PerfilAcademico
from referencias.models import Estudiante 
from import_export.widgets import DecimalWidget, IntegerWidget, ForeignKeyWidget
from decimal import Decimal
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
        except (ValueError, TypeError) as e:
            logger.error(f"ForeignKeyWidget.clean - Fila: {row} | Error de conversión: {e}")
            return None # Esto hará que la fila sea ignorada por skip_row

        try:
            # Usamos el método de la clase padre para buscar el objeto
            # --- LOGGING ---
            logger.info(f"ForeignKeyWidget.clean - Fila: {row} | Buscando en DB con: {self.field}={int_value}")
            return self.get_queryset(value, row, *args, **kwargs).get(**{self.field: int_value})
        except self.model.DoesNotExist:
            # Lanzamos un error claro que será capturado y mostrado al usuario.
            raise ValueError(f"No se encontró un '{self.model._meta.verbose_name}' con el código '{int_value}'.")

class PerfilAcademicoResource(resources.ModelResource):

    # CAMBIO CLAVE: Usamos nuestro widget personalizado para obtener mejores errores y omitir filas basura.
    est_codigo = fields.Field(
        attribute='est_codigo',
        column_name='CODIGO',
        widget=CustomForeignKeyWidget(Estudiante, field='est_codigo')
    )

    # 1. Mapeo CREDITOS_APROBADOS -> creditos_aprob_total
    creditos_aprob_total = fields.Field(
        attribute='creditos_aprob_total',
        column_name='CREDITOS_APROBADOS',
        widget=CustomDecimalWidget()
    )

    # 2. Mapeo PROMEDIO_CARRERA -> promedio
    promedio = fields.Field(
        attribute='promedio',
        column_name='PROMEDIO_CARRERA',
        widget=CustomDecimalWidget()
    )

    # 3. Mapeo APROBADAS -> num_electivas_cursadas
    num_electivas_cursadas = fields.Field(
        attribute='num_electivas_cursadas',
        column_name='APROBADAS',
        widget=IntegerWidget()
    )

    # 4. Mapeo PERIODOS_MATRICULADOS -> num_periodos_matriculados
    num_periodos_matriculados = fields.Field(
        attribute='num_periodos_matriculados',
        column_name='PERIODOS_MATRICULADOS',
        widget=IntegerWidget()
    )
    
    # 5. Definición de campos fijos/calculados
    nivelado = fields.Field(attribute='nivelado', default=False)
    porcentaje_avance = fields.Field(attribute='porcentaje_avance', default=Decimal('0.0'))
    perfil_anio = fields.Field(attribute='perfil_anio', default=date.today().year)
    perfil_semestre = fields.Field(attribute='perfil_semestre', default=1)
    
    # OMITIMOS 'estado' del mapeo directo. Su valor por defecto es FALSE en el modelo.


    def get_or_init_instance(self, instance_loader, row):
        """
        Sobrescribimos este método para controlar cómo se busca o crea la instancia.
        Esto nos permite usar año y semestre fijos en la búsqueda.
        """
        # El widget ya convirtió 'CODIGO' en una instancia de Estudiante
        estudiante_instance = self.get_instance(instance_loader, row)
        if estudiante_instance:
            try:
                # Buscamos el perfil para el año y semestre actuales
                perfil = PerfilAcademico.objects.get(
                    est_codigo=estudiante_instance,
                    perfil_anio=self.fields['perfil_anio'].get_value(None),
                    perfil_semestre=self.fields['perfil_semestre'].get_value(None)
                )
                return (perfil, False) # (instancia, es_nueva=False)
            except PerfilAcademico.DoesNotExist:
                pass # Si no existe, dejamos que el flujo normal cree una nueva

        return super().get_or_init_instance(instance_loader, row)

    def after_save_instance(self, instance, using_transactions, **kwargs):
        """
        Se llama DEPUÉS de que la instancia (PerfilAcademico) ha sido guardada
        o actualizada exitosamente en la base de datos (MySQL).
        """
        # Verificamos si el estado es False (el valor por defecto del modelo)
        if instance.estado is False:
            instance.estado = True
            # Usamos save(update_fields=...) para un guardado más eficiente
            instance.save(update_fields=['estado'])

    # CORRECCIÓN: Se añade el parámetro 'row' que es esperado por versiones
    # más recientes de django-import-export.
    def skip_row(self, instance, original, row, row_number=None, **kwargs):
        """
        Se ejecuta para cada fila. Si devuelve True, la fila se ignora por completo.
        Ideal para saltar filas de encabezado extra, pies de página o filas vacías.
        """
        # CORRECCIÓN: Usamos 'row' para acceder a los datos crudos del Excel, no 'original'.
        # 'original' es la instancia del modelo, que no es "subscriptable".
        # Asumimos que la columna 'CODIGO' es la primera (índice 0).
        codigo_valor = row[0]
        # Si no hay código de estudiante, o no es un número, es una fila inválida.
        if not codigo_valor:
            return True # Salta la fila si la celda del código está vacía.
        
        # CORRECCIÓN: Convertimos a string antes de validar con Decimal.
        # texto o está vacía pero con formato, y también maneja floats correctamente.
        try:
            Decimal(str(codigo_valor))
        except (ValueError, TypeError, Exception) as e:
            # --- LOGGING ---
            logger.warning(
                f"skip_row - Fila ignorada (row_number={row_number}). "
                f"Causa: No se pudo convertir '{codigo_valor}' a Decimal. Error: {e}"
            )
            return True
        return super().skip_row(instance, row, row_number=row_number, **kwargs)

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
