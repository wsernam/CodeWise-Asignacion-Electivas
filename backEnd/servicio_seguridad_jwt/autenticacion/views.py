# Importa la vista base de SimpleJWT que gestiona la obtención de tokens (access y refresh)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Importa el serializador personalizado que añade información adicional al token (como el rol del usuario)
from .serializers import CustomTokenObtainPairSerializer

# Vista personalizada para el login de usuarios mediante JWT
# Esta vista utiliza el serializador CustomTokenObtainPairSerializer para emitir tokens
# que incluyen información adicional como el rol del usuario
class LoginView(TokenObtainPairView):
    # Define el serializador que se usará para procesar la autenticación y generar el token
    serializer_class = CustomTokenObtainPairSerializer


# Vista para refrescar el token de acceso usando el refresh token
# Esta vista viene directamente de SimpleJWT y no necesita personalización
class CustomTokenRefreshView(TokenRefreshView):
    pass  # Usa el comportamiento por defecto de TokenRefreshView