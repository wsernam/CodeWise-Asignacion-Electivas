from rest_framework import generics
from .models import Oferta_electiva
from .serializers import OfertaElectivaSerializer
from rest_framework.response import Response
from rest_framework import status

# Endpoint para crear y listar (todos los años/semestres)
# Utilizaremos este para 'Crear oferta_electiva'
# El listado de este endpoint es general y no cumple la lógica específica
# del listado por año/semestre solicitado. Por eso crearemos una vista separada.
class OfertaElectivaCreateView(generics.CreateAPIView):
    queryset = Oferta_electiva.objects.all()
    serializer_class = OfertaElectivaSerializer

# Endpoint para editar y eliminar
# Este maneja 'Editar oferta_electiva'
class OfertaElectivaUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Oferta_electiva.objects.all()
    serializer_class = OfertaElectivaSerializer
    # Usamos `lookup_field` para especificar que la URL usará el campo
    # 'ofe_codigo' para buscar el objeto
    lookup_field = 'ofe_codigo'

# Endpoint para listar por año y semestre (todos los programas)
# Este implementa 'Listar oferta_electiva por año y semestre'
class OfertaElectivaListByAnioSemestreView(generics.ListAPIView):
    serializer_class = OfertaElectivaSerializer

    def get_queryset(self):
        # Captura los parámetros de la URL. Si no existen, devuelve un valor por defecto.
        anio = self.kwargs.get('anio')
        semestre = self.kwargs.get('semestre')

        # Filtra las ofertas basándose en el año y el semestre
        queryset = Oferta_electiva.objects.filter(
            ofe_anio=anio,
            ofe_num_semestre=semestre
        ).order_by('-ofe_anio', '-ofe_num_semestre')
        
        return queryset

# Endpoint para listar por año, semestre y programa
# Este implementa 'Listar por año, semestre y programa'
class OfertaElectivaListByAnioSemestreProgramaView(generics.ListAPIView):
    serializer_class = OfertaElectivaSerializer

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
        
        return queryset