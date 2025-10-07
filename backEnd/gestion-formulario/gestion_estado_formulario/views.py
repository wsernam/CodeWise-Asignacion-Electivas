from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Formulario

@require_http_methods(["GET"])
def get_formulario_estado(request):
    """
    Endpoint para obtener el estado actual del formulario.
    """
    # Siempre habrá solo una instancia de Formulario.
    # Si no existe, la crea con estado=False.
    formulario_instance, created = Formulario.objects.get_or_create(id=1)
    
    return JsonResponse({
        "success": True,
        "estado": formulario_instance.estado
    })

@require_http_methods(["POST"])
@csrf_exempt
def toggle_formulario(request):
    """
    Endpoint para activar o desactivar el formulario.
    """
    # Siempre habrá solo una instancia de Formulario.
    # Si no existe, la crea con estado=False.
    formulario_instance, created = Formulario.objects.get_or_create(id=1)
    
    # Invierte el estado actual
    formulario_instance.estado = not formulario_instance.estado
    formulario_instance.save()

    return JsonResponse({
        "success": True,
        "message": f"Formulario {'activado' if formulario_instance.estado else 'desactivado'}"
    })