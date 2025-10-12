from django.urls import path
from . import views

urlpatterns = [
    path('toggle-formulario/', views.toggle_formulario, name='toggle_formulario'),
    path('estado-formulario/', views.get_estado_formulario, name='get_estado_formulario'),  
]