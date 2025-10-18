
from abc import ABC, abstractmethod
from gestion_hojas_de_calculo.models import PerfilAcademico
class GestionNivelados(ABC):
    """
    Clase abstracta que define el esqueleto del algoritmo para
    calcular el porcentaje de avance y determinar si el estudiante está nivelado.
    """
    
    def gestion_nivelados(self, perfil_academico: PerfilAcademico):
        """
        Método plantilla: define el flujo general del proceso.
        """
        perfil = perfil_academico
        #creditos_oblig = self.obtener_creditos_obligatorios(perfil_academico) #EL MODELO NO TIENE ESTE ATRIBUTO
        # Podrías guardar estos resultados en la BD, imprimirlos, etc.
        #perfil.creditos_aprob_oblig = creditos_oblig
        porcentaje = self.calcular_porcentaje_avance(perfil_academico)
        perfil.porcentaje_avance = porcentaje
        nivelado = self.es_nivelado(perfil_academico)
        perfil.nivelado = nivelado
        
        perfil.save()
        
        return {
            "porcentaje_avance": porcentaje,
            "nivelado": nivelado,
            #"creditos_aprob_oblig": creditos_oblig
        }

    @abstractmethod
    def calcular_porcentaje_avance(self, perfil_academico) -> float:
        """Debe implementar cómo calcular el porcentaje de avance."""
        pass

    @abstractmethod
    def es_nivelado(self, perfil_academico) -> bool:
        """Debe implementar las condiciones específicas para considerar nivelado."""
        pass

    @abstractmethod
    def obtener_creditos_obligatorios(self, perfil_academico) -> int:
        """Debe implementar cómo obtener los créditos obligatorios."""
        pass

