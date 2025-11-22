from rest_framework.permissions import BasePermission
import logging
import jwt
import json

logger = logging.getLogger(__name__)


class IsAsignador(BasePermission):
    """
    Permiso personalizado para permitir el acceso solo a usuarios con el rol 'Asignador'.
    
    Como Kong no está pasando los claims como headers, decodificamos el JWT directamente.
    Kong ya validó que el token es válido, solo necesitamos extraer los claims.
    """
    message = "No tiene permiso para realizar esta acción. Se requiere el rol 'Asignador'."

    def has_permission(self, request, view):
        # Obtener el token del header Authorization
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            logger.warning("[Auth] No se encontró token Bearer en Authorization header")
            return False
        
        token = auth_header.replace('Bearer ', '').strip()
        
        try:
            # Decodificar el JWT SIN verificar (Kong ya lo verificó)
            # Usamos verify_signature=False porque Kong ya validó el token
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
            
            logger.info(
                f"[Auth] Token decodificado. Rol: '{user_role}', User ID: '{user_id}'"
            )
            
            # Verificamos si el rol es 'Asignador'
            has_permission = user_role == 'Asignador'
            
            if not has_permission:
                logger.warning(
                    f"[Auth] Acceso DENEGADO para rol '{user_role}'. "
                    f"Se requiere 'Asignador'."
                )
            else:
                logger.info(
                    f"[Auth] Acceso PERMITIDO para usuario {user_id} con rol '{user_role}'"
                )
            
            # Opcional: Agregar el user_id y role al request para usarlo en las vistas
            request.user_id = user_id
            request.user_role = user_role
            
            return has_permission
            
        except jwt.DecodeError as e:
            logger.error(f"[Auth] Error al decodificar JWT: {e}")
            return False
        except Exception as e:
            logger.error(f"[Auth] Error inesperado: {e}")
            return False


class IsAdministrador(BasePermission):
    """
    Permiso para usuarios con rol 'Administrador'.
    """
    message = "No tiene permiso para realizar esta acción. Se requiere el rol 'Administrador'."

    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return False
        
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
            logger.info(f"[Auth] Validando permiso IsAdministrador. Rol: '{user_role}'")
            
            request.user_id = decoded.get('user_id')
            request.user_role = user_role
            
            return user_role == 'Administrador'
            
        except Exception as e:
            logger.error(f"[Auth] Error: {e}")
            return False


class IsAutenticado(BasePermission):
    """
    Permiso que verifica que el usuario esté autenticado.
    """
    message = "No tiene permiso para realizar esta acción. Debe estar autenticado."

    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            logger.warning("[Auth] No hay token Bearer")
            return False
        
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
            
            has_permission = user_id is not None
            
            if not has_permission:
                logger.warning("[Auth] Token no contiene user_id")
            
            return has_permission
            
        except Exception as e:
            logger.error(f"[Auth] Error: {e}")
            return False


class TieneRoles(BasePermission):
    """
    Permiso flexible que acepta múltiples roles.
    
    Uso:
    class MiVista(APIView):
        permission_classes = [TieneRoles]
        roles_permitidos = ['Asignador', 'Administrador']
    """
    message = "No tiene permiso para realizar esta acción."

    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return False
        
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
            request.user_id = decoded.get('user_id')
            request.user_role = user_role
            
            logger.info(
                f"[Auth] Validando TieneRoles. "
                f"Rol: '{user_role}', Permitidos: {roles_permitidos}"
            )
            
            has_permission = user_role in roles_permitidos
            
            if not has_permission:
                logger.warning(
                    f"[Auth] Rol '{user_role}' no está en {roles_permitidos}"
                )
            
            return has_permission
            
        except Exception as e:
            logger.error(f"[Auth] Error: {e}")
            return False