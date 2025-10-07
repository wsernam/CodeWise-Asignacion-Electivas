from django.urls import path
from . import views

urlpatterns = [
    path('toggle-formulario/', views.toggle_formulario, name='toggle_formulario'),
]