from django.urls import path
from .views import ReporteAsignacionPDFView, ReporteElectivaPDFView, ReporteEstudiantePDFView

urlpatterns = [
    path('pdf/asignacion-general/', ReporteAsignacionPDFView.as_view(), name='reporte-asignacion-pdf'),
    path('pdf/electiva/<str:ele_codigo>/', ReporteElectivaPDFView.as_view(), name='reporte-electiva-pdf'),
    path('pdf/estudiante/<int:est_id>/', ReporteEstudiantePDFView.as_view(), name='reporte-estudiante-pdf'),
]
