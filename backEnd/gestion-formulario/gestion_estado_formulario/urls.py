from django.urls import path
from . import views

urlpatterns = [
    path('estado-formulario/', views.get_formulario_estado, name='get_formulario_estado'),
    path('toggle-formulario/', views.toggle_formulario, name='toggle_formulario'),
]