from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied, AuthenticationFailed
import logging
import jwt

logger = logging.getLogger(__name__)


class IsAsignador(BasePermission):
    """
    Permiso personalizado para permitir el acceso solo a usuarios con el rol 'asignador' o 'ambos'.
    """
    
    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            logger.warning("[Auth] No se encontró token Bearer")
            raise AuthenticationFailed({
                "error": "Token no proporcionado",
                "message": "Debe incluir un token JWT válido en el header Authorization."
            })
        
        token = auth_header.replace('Bearer ', '').strip()
        
        try:
            decoded = jwt.decode(
                token, 
                options={
                    "verify_signature": False,
                    "verify_exp": False,
                    "verify_aud": False
                }
            )
            
            user_role = decoded.get('role', None)
            user_id = decoded.get('user_id', None)

            user_role_lower = user_role.lower() 
            
            # Guardar en request para usarlo en vistas
            request.user_id = user_id
            request.user_role = user_role_lower
            
            logger.info(f"[Auth] Validando IsAsignador - Rol: '{user_role}', User ID: '{user_id}'")
            
            if user_role != 'asignador':
                logger.warning(f"[Auth] Acceso DENEGADO - Rol requerido: 'asignador', Rol actual: '{user_role}'")
                raise PermissionDenied({
                    "error": "Permiso denegado",
                    "message": f"Esta acción requiere el rol 'asignador'. Tu rol actual es '{user_role}'."
                })
            
            logger.info(f"[Auth] Acceso PERMITIDO para usuario {user_id}")
            return True
            
        except PermissionDenied:
            raise
        except jwt.DecodeError as e:
            logger.error(f"[Auth] Error al decodificar JWT: {e}")
            raise AuthenticationFailed({
                "error": "Token inválido",
                "message": "El token JWT proporcionado no es válido o está mal formado."
            })
        except Exception as e:
            logger.error(f"[Auth] Error inesperado: {e}")
            raise AuthenticationFailed({
                "error": "Error de autenticación",
                "message": "Ocurrió un error al procesar la autenticación."
            })


class IsAdministrador(BasePermission):
    """
    Permiso para usuarios con rol 'administrador' o 'ambos'.
    """
    
    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            raise AuthenticationFailed({
                "error": "Token no proporcionado",
                "message": "Debe incluir un token JWT válido en el header Authorization."
            })
        
        token = auth_header.replace('Bearer ', '').strip()
        
        try:
            decoded = jwt.decode(
                token, 
                options={
                    "verify_signature": False,
                    "verify_exp": False,
                    "verify_aud": False
                }
            )
            
            user_role = decoded.get('role', None)
            user_id = decoded.get('user_id', None)

            user_role_lower = user_role.lower() 
            
            request.user_id = user_id
            request.user_role = user_role_lower
            
            logger.info(f"[Auth] Validando IsAdministrador - Rol: '{user_role}'")
            
            if user_role != 'administrador':
                raise PermissionDenied({
                    "error": "Permiso denegado",
                    "message": f"Esta acción requiere el rol 'administrador'. Tu rol actual es '{user_role}'."
                })
            
            return True
            
        except PermissionDenied:
            raise
        except Exception as e:
            logger.error(f"[Auth] Error: {e}")
            raise AuthenticationFailed({
                "error": "Error de autenticación",
                "message": "Ocurrió un error al procesar la autenticación."
            })


class IsAutenticado(BasePermission):
    """
    Permiso que verifica que el usuario esté autenticado.
    """
    
    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            logger.warning("[Auth] No hay token Bearer")
            raise AuthenticationFailed({
                "error": "Token no proporcionado",
                "message": "Debe incluir un token JWT válido en el header Authorization."
            })
        
        token = auth_header.replace('Bearer ', '').strip()
        
        try:
            decoded = jwt.decode(
                token, 
                options={
                    "verify_signature": False,
                    "verify_exp": False,
                    "verify_aud": False
                }
            )
            
            user_id = decoded.get('user_id', None)
            request.user_id = user_id
            request.user_role = decoded.get('role')
            
            if not user_id:
                raise AuthenticationFailed({
                    "error": "Token incompleto",
                    "message": "El token no contiene la información necesaria de usuario."
                })
            
            logger.info(f"[Auth] Usuario autenticado: {user_id}")
            return True
            
        except PermissionDenied:
            raise
        except Exception as e:
            logger.error(f"[Auth] Error: {e}")
            raise AuthenticationFailed({
                "error": "Error de autenticación",
                "message": "Ocurrió un error al procesar la autenticación."
            })


class TieneRoles(BasePermission):
    """
    Permiso flexible que acepta múltiples roles.
    
    Uso:
    class MiVista(APIView):
        permission_classes = [TieneRoles]
        roles_permitidos = ['asignador', 'administrador']
    """
    
    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            raise AuthenticationFailed({
                "error": "Token no proporcionado",
                "message": "Debe incluir un token JWT válido en el header Authorization."
            })
        
        token = auth_header.replace('Bearer ', '').strip()
        roles_permitidos = getattr(view, 'roles_permitidos', [])
        
        try:
            decoded = jwt.decode(
                token, 
                options={
                    "verify_signature": False,
                    "verify_exp": False,
                    "verify_aud": False
                }
            )
            
            user_role = decoded.get('role', None)
            user_id = decoded.get('user_id', None)
            
            request.user_id = user_id
            request.user_role = user_role
            
            logger.info(f"[Auth] Validando TieneRoles - Rol: '{user_role}', Permitidos: {roles_permitidos}")
            
            if user_role not in roles_permitidos:
                roles_str = "', '".join(roles_permitidos)
                raise PermissionDenied({
                    "error": "Permiso denegado",
                    "message": f"Tu rol '{user_role}' no tiene acceso. Roles permitidos: '{roles_str}'."
                })
            
            return True
            
        except PermissionDenied:
            raise
        except Exception as e:
            logger.error(f"[Auth] Error: {e}")
            raise AuthenticationFailed({
                "error": "Error de autenticación",
                "message": "Ocurrió un error al procesar la autenticación."
            })