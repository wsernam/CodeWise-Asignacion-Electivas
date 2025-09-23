from django.urls import path
from .views import (
    OfertaElectivaCreateView,
    OfertaElectivaUpdateDeleteView,
    OfertaElectivaListByAnioSemestreView,
    OfertaElectivaListByAnioSemestreProgramaView
)

urlpatterns = [
    # Endpoint para 'Crear oferta_electiva'
    # Acceder con un POST a /api/ofertas/
    path('ofertas/', OfertaElectivaCreateView.as_view(), name='crear_oferta_electiva'),

    # Endpoint para 'Editar oferta_electiva' (y eliminar)
    # Acceder con PUT, PATCH, o DELETE a /api/ofertas/{id}/
    path('ofertas/<int:ofe_codigo>/', OfertaElectivaUpdateDeleteView.as_view(), name='editar_oferta_electiva'),

    # Endpoint para 'Listar oferta_electiva por año y semestre'
    # Acceder con GET a /api/ofertas/2025/1/
    path('ofertas/<int:anio>/<int:semestre>/', OfertaElectivaListByAnioSemestreView.as_view(), name='listar_oferta_por_anio_semestre'),

    # Endpoint para 'Listar por año, semestre y programa'
    # Acceder con GET a /api/ofertas/2025/1/123/
    path('ofertas/<int:anio>/<int:semestre>/<int:programa_codigo>/', OfertaElectivaListByAnioSemestreProgramaView.as_view(), name='listar_oferta_por_anio_semestre_programa'),
]