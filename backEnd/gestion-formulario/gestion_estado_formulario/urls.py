from django.urls import path
from . import views

urlpatterns = [
    # path('estado-formulario/', views.get_formulario_estado, name='get_formulario_estado'),
    path('toggle-formulario/', views.toggle_formulario, name='toggle_formulario'),
<<<<<<< HEAD
    path('get_estado-formulario/', views.get_estado_formulario, name='get_estado_formulario'),  
=======
    path('estado-formulario/', views.get_estado_formulario, name='get_estado_formulario'),  
>>>>>>> feature/gestion-electivas
]