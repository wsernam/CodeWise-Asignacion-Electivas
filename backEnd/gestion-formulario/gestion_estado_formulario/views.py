import json
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Formulario
from core.permissions import IsAdministrador

class GetFormularioEstadoView(APIView):
    """
    Endpoint para obtener el estado actual del formulario.
    """
    def get(self, request, *args, **kwargs):
        formulario_instance, created = Formulario.objects.get_or_create(id=1)
        return Response({
            "success": True,
            "estado": formulario_instance.estado
        })

class ToggleFormularioView(APIView):
    """
    Endpoint para establecer el estado del formulario.
    """
    permission_classes = [IsAdministrador]

    def post(self, request, *args, **kwargs):
        formulario_instance, created = Formulario.objects.get_or_create(id=1)
        
        try:
            nuevo_estado = request.data.get('estado')
            if nuevo_estado is None:
                return Response({
                    "success": False, 
                    "message": "Falta el campo 'estado'."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            formulario_instance.estado = bool(nuevo_estado)
            formulario_instance.save()

            return Response({
                "success": True,
                "estado": f"{'activado' if formulario_instance.estado else 'desactivado'}"
            })
        except Exception as e:
            return Response({
                "success": False,
                "message": "Error al procesar la solicitud."
            }, status=status.HTTP_400_BAD_REQUEST)

# Para consultar el estado actual del formulario
class GetEstadoFormularioView(APIView):
    """
    Endpoint para obtener el estado actual del formulario.
    """
    def get(self, request, *args, **kwargs):
        formulario_instance, created = Formulario.objects.get_or_create(id=1)
        return Response({
            "success": True,
            "estado": formulario_instance.estado
        })