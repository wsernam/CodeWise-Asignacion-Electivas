# inventario/resources.py

from import_export import resources, fields
from .models import PerfilAcademico 
from referencias.models import Estudiante 
from import_export.widgets import DecimalWidget, IntegerWidget
from decimal import Decimal
from datetime import date
from django.db import transaction # Necesario para guardar dentro del after_save

# Widget personalizado para limpiar los valores Decimales
class CustomDecimalWidget(DecimalWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if isinstance(value, str):
            value = value.replace('$', '').replace(',', '').strip()
        # Intentamos reemplazar la coma decimal por punto si viene en formato ES/LATAM
        if isinstance(value, str) and ',' in value and '.' not in value:
             value = value.replace(',', '.')
        return super().clean(value, row, *args, **kwargs)

class PerfilAcademicoResource(resources.ModelResource):
    
    # Campo auxiliar para leer el CODIGO del estudiante desde el Excel
    estudiante_codigo_excel = fields.Field(
        column_name='CODIGO',
        attribute='est_codigo', 
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


    def before_import_row(self, row, **kwargs):
        """
        Busca la instancia de Estudiante (FK) antes de procesar la fila.
        """
        est_codigo_excel = row.get('CODIGO')
        
        if not est_codigo_excel:
            raise Exception("El campo CODIGO del estudiante no puede estar vacío.")

        try:
            # 1. Buscamos la instancia de Estudiante
            estudiante_instance = Estudiante.objects.get(est_codigo=str(est_codigo_excel).strip())
            
            # 2. Asignamos la instancia de Estudiante al campo 'est_codigo' del row.
            row['est_codigo'] = estudiante_instance 
            
        except Estudiante.DoesNotExist:
            raise Estudiante.DoesNotExist(f"Estudiante con código {est_codigo_excel} no existe en la base de datos.")


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


    class Meta:
        model = PerfilAcademico
        
        # CAMBIO CLAVE: Usamos la combinación de FK + Año + Semestre para identificar
        # si se debe actualizar un registro existente o crear uno nuevo.
        import_id_fields = ('est_codigo', 'perfil_anio', 'perfil_semestre') 
        
        # Incluimos explícitamente todos los campos del modelo (excepto la PK)
        fields = (
            'estudiante_codigo_excel', # Incluido para que el resource lo reconozca
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
