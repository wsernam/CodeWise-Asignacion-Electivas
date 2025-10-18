from django.urls import path
from .api_views import ImportarProductosAPIView, ValidarExcelAPIView

urlpatterns = [
    # Endpoint para subir y procesar el archivo Excel
    path('api/importar-perfiles/', ImportarProductosAPIView.as_view(), name='api-importar-perfiles'),
    # Endpoint para validar los estudiantes de un Excel contra la BD
    path('api/excel/validar/', ValidarExcelAPIView.as_view(), name='api-excel-validar'),
]
