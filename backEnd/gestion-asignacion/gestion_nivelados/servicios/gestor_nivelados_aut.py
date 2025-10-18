from gestor_nivelados import GestorNivelados
from gestion_hojas_de_calculo.models import PerfilAcademico
from Variables import CREDITOS_TOTALES_OBLIGATORIOS_AUT, CREDITOS_NIVELADOS_8_AUT, CREDITOS_NIVELADOS_9_AUT, CREDITOS_NIVELADOS_10_AUT, CREDITOS_ELECTIVAS  
class GestorNiveladosAut(GestorNivelados.ABC):


    def calcular_porcentaje_avance(self, perfil_academico: PerfilAcademico) -> float:
        return self.obtener_creditos_obligatorios(perfil_academico) / CREDITOS_TOTALES_OBLIGATORIOS_AUT * 100

    def es_nivelado(self, perfil_academico:PerfilAcademico) -> bool:
        if perfil_academico.num_periodos_matriculados == 7:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_8_AUT
        elif perfil_academico.num_periodos_matriculados == 8:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_9_AUT
        elif perfil_academico.num_periodos_matriculados == 9:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_10_AUT
        return False

    def obtener_creditos_obligatorios(self, perfil_academico:PerfilAcademico) -> int:
        return CREDITOS_TOTALES_OBLIGATORIOS_AUT - CREDITOS_ELECTIVAS*perfil_academico.num_electivas_cursadas
        