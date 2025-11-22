# Serializador personalizado que extiende el serializador base de SimpleJWT
# Permite modificar el contenido del token JWT emitido al autenticar al usuario

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
  # Llama al método original para generar el token base (access y refresh)

    def get_token(cls, user):
        token = super().get_token(user)
         # Agrega información adicional al token: el rol del usuario
        # Esto permite que el frontend o cualquier consumidor del token
        # pueda acceder al rol sin hacer una consulta adicional
        
        token['user_id'] = str(user.id)
        token['role'] = user.role
        token['iss'] = 'auth-hs256'
        # Retorna el token modificado con el nuevo claim personalizado

        return token