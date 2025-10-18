from gestor_nivelados import GestorNivelados
from gestion_hojas_de_calculo.models import PerfilAcademico
from Variables import CREDITOS_TOTALES_OBLIGATORIOS_SIS, CREDITOS_NIVELADOS_8_SIS, CREDITOS_NIVELADOS_9_SIS, CREDITOS_NIVELADOS_10_SIS, CREDITOS_ELECTIVAS
class GestorNiveladosSis(GestorNivelados):


    
    def calcular_porcentaje_avance(self, perfil_academico:PerfilAcademico) -> float:
        return self.obtener_creditos_obligatorios(perfil_academico) / CREDITOS_TOTALES_OBLIGATORIOS_SIS * 100

    def es_nivelado(self, perfil_academico:PerfilAcademico) -> bool:
        if perfil_academico.num_periodos_matriculados == 7:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_8_SIS
        elif perfil_academico.num_periodos_matriculados == 8:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_9_SIS
        elif perfil_academico.num_periodos_matriculados == 9:
            return self.obtener_creditos_obligatorios(perfil_academico) >= CREDITOS_NIVELADOS_10_SIS
        return False

    def obtener_creditos_obligatorios(self, perfil_academico:PerfilAcademico) -> int:
        return CREDITOS_TOTALES_OBLIGATORIOS_SIS - CREDITOS_ELECTIVAS*perfil_academico.num_electivas_cursadas