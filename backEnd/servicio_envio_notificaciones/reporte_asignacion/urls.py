from django.urls import path
from .views import ReporteAsignacionPDFView, ReporteElectivaPDFView

urlpatterns = [
    path('pdf/asignacion-general/', ReporteAsignacionPDFView.as_view(), name='reporte-asignacion-pdf'),
    path('pdf/electiva/<str:ele_codigo>/', ReporteElectivaPDFView.as_view(), name='reporte-electiva-pdf'),
]
