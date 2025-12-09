# Importa el panel de administración de Django
from django.contrib import admin

# Importa funciones para definir rutas en el proyecto
from django.urls import path

# Importa la vista personalizada de login que emite tokens JWT con información adicional (como el rol del usuario)
from autenticacion.views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView

# Lista de rutas principales del proyecto
urlpatterns = [
    # Ruta para acceder al panel de administración de Django
    path('admin/', admin.site.urls),

    # Ruta para el login de usuarios mediante JWT
    # Esta vista devuelve un par de tokens (access y refresh) al autenticar correctamente
    # Utiliza el serializador personalizado que incluye el rol del usuario en el token
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
]