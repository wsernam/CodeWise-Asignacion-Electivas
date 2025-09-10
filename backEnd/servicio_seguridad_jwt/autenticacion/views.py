#Importa la vista base de SimpleJWT que gestiona la obtención de tokens (access y refresh)
from rest_framework_simplejwt.views import TokenObtainPairView

# Importa el serializador personalizado que añade información adicional al token (como el rol del usuario)
from .serializers import CustomTokenObtainPairSerializer

# Vista personalizada para el login de usuarios mediante JWT
# Esta vista utiliza el serializador CustomTokenObtainPairSerializer para emitir tokens
# que incluyen información adicional como el rol del usuario
class LoginView(TokenObtainPairView):
    # Define el serializador que se usará para procesar la autenticación y generar el token
    serializer_class = CustomTokenObtainPairSerializer