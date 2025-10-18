
from gestion_hojas_de_calculo.models import PerfilAcademico
from .servicios.fabrica import GestionNiveladosFabrica
from rest_framework.decorators import action
from models import GestionNivelados
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

        for perfil in perfiles_academicos:
            gestor = self.fabrica.get_gestor(perfil)
            gestor.gestion_nivelados(perfil)
        