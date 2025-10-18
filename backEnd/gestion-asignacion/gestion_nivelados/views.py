
from gestion_hojas_de_calculo.models import PerfilAcademico
from .servicios.fabrica import GestionNiveladosFabrica
from .servicios.gestor_nivelados import GestionNivelados
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
# Create your views here.


class GestionNiveladosViewSet:
    
    gestor = GestionNivelados()
    fabrica = GestionNiveladosFabrica()
    queryset = PerfilAcademico.objects.all()

    @action(detail=False, methods=['post'])
    def gestion_nivelados(self, request):
        """
        Recibe el periodo 
        {
            "anio": 2023,
            "num_semestre": 1}
        """
        perfiles_academicos = self.queryset.objects.filter(
            perfil_anio=request.data.get("anio"), 
            perfil_semestre=request.data.get("num_semestre")
        )
        datos_actualizados = []
        for perfil in perfiles_academicos:
            gestor = self.fabrica.get_gestor(perfil)
            datos_actualizados.append( gestor.gestion_nivelados(perfil))
        
        if datos_actualizados.count == perfiles_academicos.count:
             return Response(
            {"message": "Selección creada exitosamente"},
            status=status.HTTP_201_CREATED,
        )
        else:
            return Response(
            {"message": "Error al crear la selección"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        