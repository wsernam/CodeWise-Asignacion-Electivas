import logging
from django.core.management.base import BaseCommand
from django.db import transaction, connections
from referencias.models import Programa, Electiva, Estudiante, Oferta

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sincroniza los datos de la base de datos de formularios a la de asignación.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Iniciando sincronización de bases de datos..."))

        # Verificamos que la conexión a la DB de formulario existe
        if 'formulario' not in connections:
            self.stderr.write(self.style.ERROR("La base de datos 'formulario' no está configurada en settings.py"))
            return

        # Sincronizamos en orden para respetar las dependencias de FK
        self.sync_model(Programa, 'pro_codigo')
        self.sync_model(Electiva, 'ele_codigo')
        self.sync_model(Estudiante, 'est_codigo', fk_fields=['pro_codigo_id'])
        self.sync_model(Oferta, 'ofe_codigo', fk_fields=['ele_codigo_id', 'pro_codigo_id'])

        self.stdout.write(self.style.SUCCESS("¡Sincronización completada exitosamente!"))

    def sync_model(self, model, pk_field, fk_fields=None):
        """
        Función genérica para sincronizar un modelo de la DB 'formulario' a la DB 'default'.
        """
        model_name = model._meta.verbose_name_plural.title()
        self.stdout.write(f"Sincronizando {model_name}...")

        # Obtenemos todos los objetos de la base de datos de origen ('formulario')
        source_objects = model.objects.using('formulario').all()
        
        if not source_objects.exists():
            self.stdout.write(f"No se encontraron registros para {model_name}.")
            return

        created_count = 0
        updated_count = 0

        with transaction.atomic(): # Usamos una transacción para asegurar la consistencia
            for obj in source_objects:
                # Construimos el diccionario de datos para crear/actualizar
                data = {field.name: getattr(obj, field.name) for field in model._meta.fields}
                
                # Obtenemos el valor de la clave primaria
                pk_value = data.pop(pk_field)

                # Usamos update_or_create en la base de datos destino ('default')
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