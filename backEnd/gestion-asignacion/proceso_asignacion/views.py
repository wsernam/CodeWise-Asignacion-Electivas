from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import ProcesoAsignacion
from .serializers import ProcesoSerializer, ProcesoCambiarEstadoIn
from .services.proceso_asignacion_reset import (
    eliminar_todo_del_proceso,
)

class ProcesoCRUDViewSet(viewsets.ModelViewSet):
    queryset = ProcesoAsignacion.objects.all().order_by("-pa_fecha_creacion")
    serializer_class = ProcesoSerializer
    authentication_classes = []  # sin auth por ahora
    permission_classes = []

    # Crear: bloquear si ya hay ACTIVO
    def perform_create(self, serializer):
        if ProcesoAsignacion.objects.filter(
            pa_estado=ProcesoAsignacion.Estado.ACTIVO
        ).exists():
            raise ValidationError({
                "detail": "Ya existe un proceso de asignación ACTIVO. "
                          "Debe finalizarlo o inactivarlo antes de crear uno nuevo."
            })
        serializer.save(
            pa_paso_actual=ProcesoAsignacion.PasoActual.CREADO,
            pa_estado=ProcesoAsignacion.Estado.ACTIVO,
        )

    # Últimos 5 creados
    @action(detail=False, methods=["get"], url_path="ultimos")
    def ultimos(self, request):
        qs = ProcesoAsignacion.objects.order_by("-pa_fecha_creacion")[:5]
        return Response(ProcesoSerializer(qs, many=True).data)

    # Periodo del último ACTIVO
    @action(detail=False, methods=["get"], url_path="periodo-activo")
    def periodo_activo(self, request):
        obj = (
            ProcesoAsignacion.objects
            .filter(pa_estado=ProcesoAsignacion.Estado.ACTIVO)
            .order_by("-pa_fecha_creacion")
            .first()
        )
        if not obj:
            return Response(status=status.HTTP_204_NO_CONTENT)
        data = {
            "pa_codigo": obj.pa_codigo,
            "pa_anio": obj.pa_anio,
            "pa_num_semestre": obj.pa_num_semestre,
            "periodo": f"{obj.pa_anio}-{obj.pa_num_semestre}",
            "pa_fecha_creacion": obj.pa_fecha_creacion,
        }
        return Response(data, status=status.HTTP_200_OK)

    # Cambiar estado (respetando "solo 1 ACTIVO")
    @action(detail=True, methods=["patch"], url_path="estado")
    def cambiar_estado(self, request, pk=None):
        obj = self.get_object()
        ser = ProcesoCambiarEstadoIn(data=request.data)
        ser.is_valid(raise_exception=True)
        nuevo_estado = int(ser.validated_data["pa_estado"])

        if obj.pa_estado == nuevo_estado:
            return Response(ProcesoSerializer(obj).data)

        if nuevo_estado == ProcesoAsignacion.Estado.ACTIVO:
            existe_otro_activo = ProcesoAsignacion.objects.filter(
                pa_estado=ProcesoAsignacion.Estado.ACTIVO
            ).exclude(pk=obj.pk).exists()
            if existe_otro_activo:
                raise ValidationError({"detail": "Ya existe otro proceso ACTIVO."})

        obj.pa_estado = nuevo_estado
        try:
            obj.save(update_fields=["pa_estado", "pa_ultima_fecha_actualizacion"])
        except IntegrityError:
            # Respaldo por constraint a nivel BD
            raise ValidationError({"detail": "No se pudo activar: ya hay otro ACTIVO."})

        return Response(ProcesoSerializer(obj).data)
    
     # eliminar perfiles, asignaciones y proceso
    @action(detail=True, methods=["post"], url_path="eliminar-todo")
    def eliminar_todo(self, request, pk=None):
        """
        Elimina TODO lo generado para este proceso:
        - Perfiles académicos del año/semestre del proceso
        - Asignaciones del año/semestre del proceso
        - El propio ProcesoAsignacion

        Solo si el proceso está ACTIVO y NO está FINALIZADO.
        """
        obj = self.get_object()  # por si luego quieres validar algo más

        try:
            eliminar_todo_del_proceso(obj.pa_codigo)
        except DjangoValidationError as e:
            # Convertimos la ValidationError de Django en ValidationError de DRF
            raise ValidationError({"detail": e.message})

        return Response(
            {
                "detail": (
                    "Perfiles académicos, asignaciones y proceso de asignación "
                    "eliminados correctamente. Ya puedes iniciar de nuevo la "
                    "asignación para ese periodo."
                )
            },
            status=status.HTTP_200_OK,
        )
