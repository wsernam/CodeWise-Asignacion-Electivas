"""
Middleware personalizado para manejar respuestas de autenticación y permisos.
Coloca este archivo en: tu_app/middleware.py
"""
import json
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)


class CustomAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware que intercepta respuestas 401 y 403 para personalizar los mensajes de error.
    """
    
    def process_response(self, request, response):
        """
        Intercepta las respuestas para personalizar mensajes de error de autenticación y permisos.
        """
        # Solo procesamos respuestas 401 (No autenticado) y 403 (Sin permiso)
        if response.status_code == 401:
            return self._handle_unauthorized(request, response)
        elif response.status_code == 403:
            return self._handle_forbidden(request, response)
        
        return response
    
    def _handle_unauthorized(self, request, response):
        """
        Maneja respuestas 401 (No autenticado).
        """
        logger.warning(f"[Auth] Intento de acceso sin autenticación a: {request.path}")
        
        return JsonResponse({
            "error": "No autenticado",
            "message": "No se proporcionaron credenciales de autenticación válidas. Por favor, incluya un token JWT válido en el header Authorization."
        }, status=401)
    
    def _handle_forbidden(self, request, response):
        """
        Maneja respuestas 403 (Sin permiso).
        """
        # Intentar obtener el mensaje de error del permiso
        try:
            data = json.loads(response.content.decode('utf-8'))
            # Si el permiso ya envió un mensaje personalizado, usarlo
            if isinstance(data, dict) and 'message' in data:
                return JsonResponse({
                    "error": data.get('error', 'Permiso denegado'),
                    "message": data.get('message')
                }, status=403)
        except:
            pass
        
        # Obtener información del usuario del request (si está disponible)
        user_role = getattr(request, 'user_role', None)
        
        logger.warning(
            f"[Auth] Acceso denegado a: {request.path} | Rol: {user_role}"
        )
        
        # Mensaje genérico si no hay información del rol
        if not user_role:
            message = "No tienes permisos suficientes para realizar esta acción."
        else:
            message = f"No tienes permisos suficientes para realizar esta acción. Tu rol actual es '{user_role}'."
        
        return JsonResponse({
            "error": "Permiso denegado",
            "message": message
        }, status=403)