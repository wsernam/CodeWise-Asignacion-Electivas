from .gestor_nivelados import GestorNivelados
from gestion_hojas_de_calculo.models import PerfilAcademico
from .variables import CREDITOS_TOTALES_OBLIGATORIOS_ELE, CREDITOS_NIVELADOS_8_ELE, CREDITOS_NIVELADOS_9_ELE, CREDITOS_NIVELADOS_10_ELE, CREDITOS_ELECTIVAS
class GestorNiveladosEle(GestorNivelados):

    
    def _calcular_porcentaje_avance(self, cantidad_creditos_obligatorios:int) -> float:
        return cantidad_creditos_obligatorios / CREDITOS_TOTALES_OBLIGATORIOS_ELE * 100

    def _es_nivelado(self, perfil_academico:PerfilAcademico) -> bool:
        if perfil_academico.num_periodos_matriculados == 7:
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_8_ELE
        elif perfil_academico.num_periodos_matriculados == 8:
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_9_ELE
        elif perfil_academico.num_periodos_matriculados == 9:
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_10_ELE
        return False
