"""
URL configuration for microservicio_gestion_formulario project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from gestion_electivas.views import ElectivaViewSet
from gestion_programas.views import ProgramaViewSet
from gestion_estudiantes.views import EstudianteViewSet
from seleccion_electivas.views import SeleccionEstudianteElectivaViewSet
from gestion_reportes.views import ReporteSeleccionElectivasEstudianteViewSet
router = DefaultRouter()
router.register(r'electivas', ElectivaViewSet, basename='electiva')
router.register(r'programas', ProgramaViewSet, basename='programa')
router.register(r'estudiantes', EstudianteViewSet, basename='estudiante')
router.register(r'seleccion-electivas', SeleccionEstudianteElectivaViewSet, basename='seleccion-electivas')
router.register(r'reporte-seleccion', ReporteSeleccionElectivasEstudianteViewSet, basename='reporte-seleccion-electivas')
urlpatterns = [
    path('admin/', admin.site.urls),
    # URLs para la gestión del estado del formulario
    path('estado/', include('gestion_estado_formulario.urls')),
    path('ofertaElectiva/', include('gestion_oferta_electiva.urls')),
    path('api/', include(router.urls))
]
