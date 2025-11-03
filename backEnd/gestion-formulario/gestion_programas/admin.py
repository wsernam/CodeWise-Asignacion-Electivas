from django.contrib import admin
from gestion_electivas.models import Programa

@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ('pro_codigo', 'pro_nombre', 'fac_codigo', 'pro_activo')
    list_filter = ('fac_codigo', 'pro_activo')
    search_fields = ('pro_nombre', 'pro_codigo')
