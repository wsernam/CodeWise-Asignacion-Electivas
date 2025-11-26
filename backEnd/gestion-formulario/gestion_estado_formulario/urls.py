from django.urls import path
from .views import GetFormularioEstadoView, ToggleFormularioView

urlpatterns = [
    path('estado-formulario/', GetFormularioEstadoView.as_view(), name='get_formulario_estado'),
    path('toggle-formulario/', ToggleFormularioView.as_view(), name='toggle_formulario'),
]