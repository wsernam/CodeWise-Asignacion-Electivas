import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Formulario

@require_http_methods(["POST"])
@csrf_exempt
def toggle_formulario(request):
    """
    Endpoint para estabelcer el estado del formulario
    """
    # Siempre habrá solo una instancia de Formulario.
    # Si no existe, la crea con estado=False.
    formulario_instance, created = Formulario.objects.get_or_create(id=1)
    
    # Invierte el estado actual
    #formulario_instance.estado = not formulario_instance.estado
    #formulario_instance.save()

    try:
        data = json.loads(request.body)
        nuevo_estado = data.get('estado')
        if nuevo_estado is None:
            return JsonResponse({
                "success": False, 
                "message": "Falta el campo 'estado'."}, status=400)
        # Establece el nuevo estado
        formulario_instance.estado = bool(nuevo_estado)
        formulario_instance.save()

        return JsonResponse({
            "success": True,
            "estado": f"{'activado' if formulario_instance.estado else 'desactivado'}"
        })
    except json.JSONDecodeError as e:
        return JsonResponse({
            "success": False,
            "message": "JSON no válido"
        }, status=400)
    
# Para consultar el estado actual del formulario
@require_http_methods(["GET"])
@csrf_exempt
def get_estado_formulario(request):
    """
    Endpoint para obtener el estado actual del formulario.
    """
    formulario_instance, created = Formulario.objects.get_or_create(id=1)
    
    return JsonResponse({
        "success": True,
        "estado": formulario_instance.estado
    })