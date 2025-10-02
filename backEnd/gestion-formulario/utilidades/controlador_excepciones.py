# utils/exception_handler.py
from django.db import IntegrityError
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def controlador_excepciones(exc, context):
    # Llamar primero al handler por defecto
    response = exception_handler(exc, context)

    if isinstance(exc, IntegrityError):
        view = context.get("view")
        view_name = view.__class__.__name__ if view else "UnknownView"

        # puedes mapear cada view a un mensaje personalizado
        messages = {
            "SeleccionElectivaViewSet": "El estudiante o la electiva referenciada no existen.",
            "EstudianteViewSet": "El programa académico referenciado no existe.",
            "OfertaElectivaCreateView": "La electiva o programa referenciado no existe.",
            "OtroViewSet": "Error de integridad al procesar la operación en esta vista."
        }

        detail = messages.get(view_name, "Error de integridad en la base de datos.")

        return Response(
            {"detail": detail},
            status=status.HTTP_400_BAD_REQUEST
        )

    return response
