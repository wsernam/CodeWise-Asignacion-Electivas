from django.urls import path
from .views import GestionNiveladosViewSet
from rest_framework.routers import DefaultRouter


gestion_view = GestionNiveladosViewSet.as_view({
    'post': 'gestionar_nivelados'
})

confirmar_view = GestionNiveladosViewSet.as_view({
    'post': 'confirmar_nivelados'
})

listar_view = GestionNiveladosViewSet.as_view({
    'get': 'listar_nivelados'
})

urlpatterns = [
    path('nivelados/gestionar-nivelados/', gestion_view, name='nivelados-gestionar-nivelados'),
    path('nivelados/confirmar-nivelados/<int:anio>/<int:semestre>/', confirmar_view, name='nivelados-confirmar-nivelados'),
    path('nivelados/listar-nivelados/<int:anio>/<int:semestre>/', listar_view, name='nivelados-listar-nivelados'),
]