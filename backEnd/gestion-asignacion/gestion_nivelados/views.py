
from gestion_hojas_de_calculo.models import PerfilAcademico
from .servicios.fabrica import GestionNiveladosFabrica
from .servicios.gestor_nivelados import GestorNivelados
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import consultaNiveladosSerializer

@method_decorator(csrf_exempt, name='dispatch')
class GestionNiveladosViewSet(viewsets.ViewSet):
    
    gestor:GestorNivelados
    fabrica = GestionNiveladosFabrica()
    queryset = PerfilAcademico.objects.all()

    @transaction.atomic
    @action(detail=False,
             methods=['put'],
             url_path='gestionar-nivelados')
    def gestionar_nivelados(self, request):
        """
        Recibe el periodo 
        {
            "anio": 2023,
            "num_semestre": 1}
        """
        perfiles_academicos = self.queryset.filter(
            perfil_anio=request.data.get("anio"), 
            perfil_semestre=request.data.get("num_semestre")
        )
        datos_actualizados = []
        for perfil in perfiles_academicos:
            gestor = self.fabrica.get_gestor(perfil)
            datos_actualizados.append( gestor.gestion_nivelados(perfil))
        
        return Response(
            {"message": "Los datos fueron gestionados correctamente"},
            status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=['get'],
        url_path=r'listar-nivelados/(?P<anio>\d{4})/(?P<semestre>\d+)'
    )
    def listar_nivelados(self, request, anio, semestre):
        """
        Retorna todos los perfiles academicos nivelados
        filtrados por año y semestre del path.
        """
        perfiles_nivelados = self.queryset.filter(
            nivelado=True,
            perfil_anio=anio,
            perfil_semestre=semestre
        )
        serializer = consultaNiveladosSerializer(perfiles_nivelados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False,
             methods=['put'],
             url_path=r'confirmar-nivelados/(?P<anio>\d{4})/(?P<semestre>\d+)')
    def confirmar_nivelados(self, request,anio, semestre):
        """
        Recibe el periodo 
        {[
            {
            "est_codigo": 100621021344,
            "nivelado": 1
            }
        }]
        """
        data = request.data
        perfiles_academicos = self.queryset.filter(
            perfil_anio=anio,
            perfil_semestre=semestre
        )
        
        actualizados_count = 0
        no_encontrados = []

        for estudiante in data:
            try:
                # Usamos .get() dentro de un try-except para manejar el caso de que no exista
                perfil = perfiles_academicos.get(est_codigo__est_codigo=estudiante['est_codigo'])
                perfil.nivelado = bool(estudiante['nivelado'])
                if estudiante['nivelado']:
                    perfil.porcentaje_avance = 100.0
                perfil.save()
                actualizados_count += 1
            except PerfilAcademico.DoesNotExist:
                # Si el perfil no existe, guardamos el código del estudiante para informarlo
                no_encontrados.append(estudiante.get('est_codigo'))

        mensaje = f"Se confirmaron {actualizados_count} perfiles de nivelados correctamente."
        if no_encontrados:
            mensaje += f" No se encontraron perfiles para los siguientes estudiantes: {no_encontrados}."
        
        return Response(
            {"message": mensaje},
            status=status.HTTP_200_OK)