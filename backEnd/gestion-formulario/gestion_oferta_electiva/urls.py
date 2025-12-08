from django.urls import path, include
from .views import (
    OfertaElectivaCreateView,
    OfertaElectivaBulkCreateView,
    OfertaElectivaUpdateDeleteView,
    OfertaElectivaListByAnioSemestreView,
    OfertaElectivaListByAnioSemestreProgramaView,
    UltimoPeriodoOfertaView
)

urlpatterns = [
    # Endpoint para 'Crear oferta_electiva'
    # Acceder con un POST a /api/ofertas/
    path('ofertas/', OfertaElectivaCreateView.as_view(), name='crear_oferta_electiva'),

    # Endpoint para 'Crear múltiples ofertas de electivas'
    path('ofertas/bulk-create/', OfertaElectivaBulkCreateView.as_view(), name='crear_oferta_electiva_bulk'),

    # Endpoint para 'Editar oferta_electiva' (y eliminar)
    # Acceder con PUT, PATCH, o DELETE a /api/ofertas/{id}/
    path('ofertas/<int:ofe_codigo>/', OfertaElectivaUpdateDeleteView.as_view(), name='editar_oferta_electiva'),

    # Endpoint para 'Listar oferta_electiva por año y semestre'
    # Acceder con GET a /api/ofertas/2025/1/
    path('ofertas/<int:anio>/<int:semestre>/', OfertaElectivaListByAnioSemestreView.as_view(), name='listar_oferta_por_anio_semestre'),

    # Endpoint para 'Listar por año, semestre y programa'
    # Acceder con GET a /api/ofertas/2025/1/'PIS'/
    path('ofertas/<int:anio>/<int:semestre>/<str:programa_codigo>/', OfertaElectivaListByAnioSemestreProgramaView.as_view(), name='listar_oferta_por_anio_semestre_programa'),

    # Endpoint para 'obtener el último periodo académico disponible en las ofertas'
    # Acceder con GET a /periodo-ultima-oferta/
    path('periodo-ultima-oferta/', UltimoPeriodoOfertaView.as_view(), name='obtener_ultimo_periodo_oferta'),
]