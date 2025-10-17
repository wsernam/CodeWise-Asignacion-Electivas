# proceso_asignacion/urls.py
from rest_framework.routers import DefaultRouter
from .views import ProcesoCRUDViewSet   # <- vistas en la raíz de la app

router = DefaultRouter()
router.register(r"procesos", ProcesoCRUDViewSet, basename="procesos")

urlpatterns = router.urls
