from django.urls import path
from .views import LotesCodigosSeleccionesView, ReporteAsignacionPDFView, ReporteElectivaPDFView, ReporteEstudiantePDFView, ReporteLotesSeleccionesPDFView,ReporteGeneralAsignacion

urlpatterns = [
    path('pdf/asignacion-general/', ReporteAsignacionPDFView.as_view(), name='reporte-asignacion-pdf'),
    path('pdf/electiva/<str:ele_codigo>/', ReporteElectivaPDFView.as_view(), name='reporte-electiva-pdf'),
    path('pdf/estudiante/<str:est_id>/', ReporteEstudiantePDFView.as_view(), name='reporte-estudiante-pdf'),
    path('pdf/lotes-selecciones/', ReporteLotesSeleccionesPDFView.as_view(), name='reporte-lotes-selecciones-pdf'),
    path('lotes-selecciones/', LotesCodigosSeleccionesView.as_view(), name='lotes-selecciones'),
    path('pdf/reporte-asignacion-general/', ReporteGeneralAsignacion.as_view(), name='reporte-general-asignacion-pdf')
]
