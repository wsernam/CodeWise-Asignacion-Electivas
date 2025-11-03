
from abc import ABC, abstractmethod
from gestion_hojas_de_calculo.models import PerfilAcademico
from .variables import CREDITOS_ELECTIVAS
class GestorNivelados(ABC):
    """
    Clase abstracta que define el esqueleto del algoritmo para
    calcular el porcentaje de avance y determinar si el estudiante está nivelado.
    """
    
    def gestion_nivelados(self, perfil_academico: PerfilAcademico):
        """
        Método plantilla: define el flujo general del proceso.
        """
        perfil = perfil_academico
        cantidad_creditos_obligatorios = self._obtener_creditos_obligatorios(perfil_academico) 
        porcentaje = self._calcular_porcentaje_avance(cantidad_creditos_obligatorios)
        perfil.porcentaje_avance = porcentaje
        nivelado = self._es_nivelado(perfil_academico)
        perfil.nivelado = nivelado
        
        perfil.save()
        
        return {
            "porcentaje_avance": porcentaje,
            "nivelado": nivelado
        }

    def _obtener_creditos_obligatorios(self, perfil_academico:PerfilAcademico) -> int:
        return perfil_academico.creditos_aprob_total - CREDITOS_ELECTIVAS*perfil_academico.num_electivas_cursadas
    
    @abstractmethod
    def _calcular_porcentaje_avance(self, cantidad_creditos_obligatorios:int) -> float:
        """Debe implementar cómo calcular el porcentaje de avance."""
        pass

    @abstractmethod
    def _es_nivelado(self, perfil_academico:PerfilAcademico) -> bool:
        """Debe implementar las condiciones específicas para considerar nivelado."""
        pass


    

