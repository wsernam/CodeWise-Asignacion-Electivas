from rest_framework import generics, status
from .models import Oferta_electiva 
from .serializers import OfertaElectivaSerializer
from rest_framework.response import Response
from .serializers import OfertaElectivaBulkCreateSerializer
from gestion_electivas.models import Electiva
from .serializers import ElectivaSerializer
from events.oferta_publisher import publish_oferta_creada, publish_oferta_actualizada, publish_oferta_eliminada

# Endpoint para crear y listar (todos los años/semestres)
# Utilizaremos este para 'Crear oferta_electiva'
# El listado de este endpoint es general y no cumple la lógica específica
# del listado por año/semestre solicitado. Por eso crearemos una vista separada.
class OfertaElectivaCreateView(generics.CreateAPIView):
    queryset = Oferta_electiva.objects.all()
    serializer_class = OfertaElectivaSerializer
    def perform_create(self, serializer):
        instance = serializer.save()
        payload = _serialize_oferta(instance)
        # Publica SOLO si la transacción se confirma
        transaction.on_commit(lambda: publish_oferta_creada(payload))

# Endpoint para crear múltiples ofertas de electivas a la vez
class OfertaElectivaBulkCreateView(generics.CreateAPIView):
    serializer_class = OfertaElectivaBulkCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        # Si se creó al menos una oferta, devolvemos 201.
        # Si todas ya existían, devolvemos 200.
        response_status = status.HTTP_201_CREATED if result['creadas'] else status.HTTP_200_OK
        return Response(result, status=response_status)

# Endpoint para editar y eliminar
# Este maneja 'Editar oferta_electiva'
class OfertaElectivaUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Oferta_electiva.objects.all()
    serializer_class = OfertaElectivaSerializer
    # Usamos `lookup_field` para especificar que la URL usará el campo
    # 'ofe_codigo' para buscar el objeto
    lookup_field = 'ofe_codigo'

    def perform_update(self, serializer):
        instance = serializer.save()
        payload = _serialize_oferta(instance)
        transaction.on_commit(lambda: publish_oferta_actualizada(payload))

    def perform_destroy(self, instance):
        # Captura payload ANTES del delete
        payload = _serialize_oferta(instance)
        super().perform_destroy(instance)
        transaction.on_commit(lambda: publish_oferta_eliminada(payload))
    

# Endpoint para listar por año y semestre (todos los programas)
# Este implementa 'Listar oferta_electiva por año y semestre'
class OfertaElectivaListByAnioSemestreView(generics.ListAPIView):
    serializer_class = ElectivaSerializer

    def get_queryset(self):
        # Captura los parámetros de la URL. Si no existen, devuelve un valor por defecto.
        anio = self.kwargs.get('anio')
        semestre = self.kwargs.get('semestre')

        # Filtra las ofertas basándose en el año y el semestre
        queryset = Oferta_electiva.objects.filter(
            ofe_anio=anio,
            ofe_num_semestre=semestre
        ).order_by('-ofe_anio', '-ofe_num_semestre')
        
        lista_electivas = []
        for oferta in queryset:
            electiva_info = {
                "ele_codigo": oferta.ele_codigo.ele_codigo,
                "ele_nombre": oferta.ele_codigo.ele_nombre
            }
            lista_electivas.append(electiva_info)
        return lista_electivas

# Endpoint para listar por año, semestre y programa
# Este implementa 'Listar por año, semestre y programa'
class OfertaElectivaListByAnioSemestreProgramaView(generics.ListAPIView):
    serializer_class = ElectivaSerializer

    def get_queryset(self):
        # Captura los parámetros de la URL
        anio = self.kwargs.get('anio')
        semestre = self.kwargs.get('semestre')
        programa_codigo = self.kwargs.get('programa_codigo')

        # Filtra las ofertas basándose en los tres parámetros
        queryset = Oferta_electiva.objects.filter(
            ofe_anio=anio,
            ofe_num_semestre=semestre,
            pro_codigo__pro_codigo=programa_codigo
        ).order_by('-ofe_anio', '-ofe_num_semestre')
        
        lista_electivas = []
        for oferta in queryset:
            electiva_info = {
                "ele_codigo": oferta.ele_codigo.ele_codigo,
                "ele_nombre": oferta.ele_codigo.ele_nombre
            }
            lista_electivas.append(electiva_info)
        return lista_electivas
    
# ---------- Helper: payload para RabbitMQ ----------
def _serialize_oferta(o: Oferta_electiva) -> dict:
    """
    Convierte la oferta en un dict seguro para enviar por RabbitMQ.
    Ajusta/añade campos si tu modelo tiene más (cupos, docente, horario, etc.).
    """
    return {
        "ofe_codigo": getattr(o, "ofe_codigo", None),
        "ofe_anio": getattr(o, "ofe_anio", None),
        "ofe_num_semestre": getattr(o, "ofe_num_semestre", None),
        "ele_codigo": getattr(getattr(o, "ele_codigo", None), "ele_codigo", None),
        "pro_codigo": getattr(getattr(o, "pro_codigo", None), "pro_codigo", None),
        # Ejemplos opcionales (si existen en tu modelo):
        "cupos": getattr(o, "ofe_cupos", None),
        "docente": getattr(o, "ofe_docente", None),
        "horario": getattr(o, "ofe_horario", None),
        "activo": getattr(o, "ofe_activo", True),
    }