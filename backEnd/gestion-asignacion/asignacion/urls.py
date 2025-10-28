from rest_framework.routers import DefaultRouter
from .views import PrioridadViewSet, AsignacionOrquestadorViewSet

router = DefaultRouter()
router.register(r"ListaPrioridadEstudiantes", PrioridadViewSet, basename="ListaPrioridadEstudiantes")
router.register(r"asignacion", AsignacionOrquestadorViewSet, basename="asignacion")

urlpatterns = router.urls