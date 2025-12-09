from .gestor_nivelados import GestorNivelados
from gestion_hojas_de_calculo.models import PerfilAcademico
from .variables import CREDITOS_TOTALES_OBLIGATORIOS_AUT, CREDITOS_NIVELADOS_8_AUT, CREDITOS_NIVELADOS_9_AUT, CREDITOS_NIVELADOS_10_AUT, CREDITOS_ELECTIVAS  
class GestorNiveladosAut(GestorNivelados):


    def _calcular_porcentaje_avance(self, cantidad_creditos_obligatorios:int) -> float:
        return min(cantidad_creditos_obligatorios / CREDITOS_TOTALES_OBLIGATORIOS_AUT * 100, 100.0)

    def _es_nivelado(self, perfil_academico:PerfilAcademico) -> bool:
        if perfil_academico.num_periodos_matriculados == 7:
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_8_AUT
        elif perfil_academico.num_periodos_matriculados == 8:
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_9_AUT
        elif perfil_academico.num_periodos_matriculados == 9:
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_10_AUT
        return False

        