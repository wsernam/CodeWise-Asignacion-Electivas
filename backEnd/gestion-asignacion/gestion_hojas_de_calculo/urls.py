from django.urls import path
from .api_views import ImportarProductosAPIView

urlpatterns = [
    # Endpoint para subir y procesar el archivo Excel
    path('api/importar-perfiles/', ImportarProductosAPIView.as_view(), name='api-importar-perfiles'),
]
