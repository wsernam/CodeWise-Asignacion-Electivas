from gestor_nivelados import GestorNivelados
from gestion_hojas_de_calculo.models import PerfilAcademico
from Variables import CREDITOS_TOTALES_OBLIGATORIOS_ELE, CREDITOS_NIVELADOS_8_ELE, CREDITOS_NIVELADOS_9_ELE, CREDITOS_NIVELADOS_10_ELE, CREDITOS_ELECTIVAS
class GestorNiveladosEle(GestorNivelados):

    
    def calcular_porcentaje_avance(self, perfil_academico:PerfilAcademico) -> float:
        return self.obtener_creditos_obligatorios(perfil_academico) / CREDITOS_TOTALES_OBLIGATORIOS_ELE * 100

    def es_nivelado(self, perfil_academico:PerfilAcademico) -> bool:
        if perfil_academico.num_periodos_matriculados == 7:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_8_ELE
        elif perfil_academico.num_periodos_matriculados == 8:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_9_ELE
        elif perfil_academico.num_periodos_matriculados == 9:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_10_ELE
        return False
    
    def obtener_creditos_obligatorios(self, perfil_academico:PerfilAcademico) -> int:
        return  CREDITOS_TOTALES_OBLIGATORIOS_ELE - CREDITOS_ELECTIVAS*perfil_academico.num_electivas_cursadas 