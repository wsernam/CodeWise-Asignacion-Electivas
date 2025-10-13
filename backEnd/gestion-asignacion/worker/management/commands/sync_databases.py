import logging
from django.core.management.base import BaseCommand
from django.db import transaction, connections, models as django_models

# Importamos los modelos a nivel de módulo para que sean accesibles en todas las funciones.
from referencias.models import Programa, Electiva, Estudiante, Oferta, SeleccionEstudianteElectiva

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sincroniza los datos de la base de datos de formularios a la de asignación.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Iniciando sincronización de bases de datos..."))

        # Verificamos que la conexión a la DB de formulario existe
        if 'formulario' not in connections:
            self.stderr.write(self.style.ERROR("La base de datos 'formulario' no está configurada en settings.py"))
            return

        # Mapeo de modelos a los nombres de tabla correctos en la DB 'formulario'
        source_table_names = {
            Programa: 'gestion_electivas_programa', # CORRECCIÓN: El modelo Programa vive en la app gestion_electivas
            Electiva: 'gestion_electivas_electiva',
            Estudiante: 'gestion_estudiantes_estudiante',
            Oferta: 'gestion_oferta_electiva_oferta_electiva',
            SeleccionEstudianteElectiva: 'Seleccion_estudiante_electiva',
            # Añade aquí otros modelos si es necesario
        }

        # Sincronizamos en orden para respetar las dependencias de FK
        # Es CRÍTICO que el orden respete las dependencias (e.g., Programa antes que Estudiante)
        self.sync_model(Programa, 'pro_codigo', source_table_names)
        self.sync_model(Electiva, 'ele_codigo', source_table_names)
        self.sync_model(Estudiante, 'est_codigo', source_table_names)
        self.sync_model(Oferta, 'ofe_codigo', source_table_names)
        self.sync_model(SeleccionEstudianteElectiva, 'sel_codigo', source_table_names)

        self.stdout.write(self.style.SUCCESS("¡Sincronización completada exitosamente!"))

    def sync_model(self, model: django_models.Model, pk_field: str, source_table_map: dict):
        """
        Función genérica para sincronizar un modelo de la DB 'formulario' a la DB 'default'.
        """
        model_name = model._meta.verbose_name_plural.title()
        self.stdout.write(f"Sincronizando {model_name}...")

        source_table_name = source_table_map.get(model)
        if not source_table_name:
            self.stderr.write(self.style.ERROR(f"No se encontró el nombre de la tabla de origen para {model_name}."))
            return

        # 1. Guardamos el nombre original de la tabla y lo cambiamos TEMPORALMENTE para la LECTURA
        original_db_table = model._meta.db_table
        model._meta.db_table = source_table_name 
        

        try:
            # Usamos una consulta SQL en crudo para leer los datos.
            # Esto nos da control total y evita los problemas del ORM con nombres de campo diferentes.
            with connections['formulario'].cursor() as cursor:
                cursor.execute(f"SELECT * FROM {source_table_name}")
                columns = [col[0] for col in cursor.description]
                source_data = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
        except Exception as e:
            model._meta.db_table = original_db_table
            self.stderr.write(self.style.ERROR(f"Error al leer {model_name} de 'formulario': {e}"))
            return
        

        # Restauramos el nombre de la tabla para las operaciones de escritura.
        model._meta.db_table = original_db_table

        if not source_data:
            self.stdout.write(f"No se encontraron registros para {model_name}.")
            return

        
        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for data in source_data:
                # --- LÓGICA DE RENOMBRADO PRECISA BASADA EN EL ESQUEMA ---

                # Caso 1: Para el modelo Programa, la columna 'fac_codigo_id' del origen
                # debe mapear al campo 'fac_codigo' del destino.
                if model == Programa and 'fac_codigo_id' in data:
                    data['fac_codigo'] = data.pop('fac_codigo_id')

                # Caso 2: Para SeleccionEstudianteElectiva, las columnas 'ele_codigo' y 'est_codigo'
                # del origen deben mapear a 'ele_codigo_id' y 'est_codigo_id' en el destino.
                if model == SeleccionEstudianteElectiva:
                    if 'ele_codigo' in data:
                        data['ele_codigo_id'] = data.pop('ele_codigo')
                    if 'est_codigo' in data:
                        data['est_codigo_id'] = data.pop('est_codigo')

                # Obtenemos el valor de la clave primaria para la condición `update_or_create`
                pk_value = data.get(pk_field)

                _, created = model.objects.using('default').update_or_create(
                    **{pk_field: pk_value},
                    defaults=data
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"-> {model_name}: {created_count} creados, {updated_count} actualizados."
        ))