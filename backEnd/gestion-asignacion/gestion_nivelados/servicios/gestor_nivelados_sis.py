from .gestor_nivelados import GestorNivelados
from gestion_hojas_de_calculo.models import PerfilAcademico
from .variables import CREDITOS_TOTALES_OBLIGATORIOS_SIS, CREDITOS_NIVELADOS_8_SIS, CREDITOS_NIVELADOS_9_SIS, CREDITOS_NIVELADOS_10_SIS, CREDITOS_ELECTIVAS
class GestorNiveladosSis(GestorNivelados):

    
    def _calcular_porcentaje_avance(self, cantidad_creditos_obligatorios:int) -> float:
        return min(cantidad_creditos_obligatorios / CREDITOS_TOTALES_OBLIGATORIOS_SIS * 100, 100.0)

    def _es_nivelado(self, perfil_academico:PerfilAcademico) -> bool:
        if perfil_academico.num_periodos_matriculados == 7:
            print(f" est_codigo:{perfil_academico.est_codigo}  Créditos aprobados: {perfil_academico.creditos_aprob_total}," 
                  f"Requeridos: {CREDITOS_NIVELADOS_8_SIS}," 
                  f"es nivelado: {perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_8_SIS}", flush=True)
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_8_SIS
        elif perfil_academico.num_periodos_matriculados == 8:
            print(f" est_codigo:{perfil_academico.est_codigo}  Créditos aprobados: {perfil_academico.creditos_aprob_total}," 
                  f"Requeridos: {CREDITOS_NIVELADOS_9_SIS}," 
                  f"es nivelado: {perfil_academico.creditos_aprob_total >=CREDITOS_NIVELADOS_9_SIS}",flush=True)
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_9_SIS
        elif perfil_academico.num_periodos_matriculados == 9:
            print(f" est_codigo:{perfil_academico.est_codigo}  Créditos aprobados: {perfil_academico.creditos_aprob_total}," 
                  f"Requeridos: {CREDITOS_NIVELADOS_10_SIS}," 
                  f"es nivelado: {perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_10_SIS}",flush=True)
            return perfil_academico.creditos_aprob_total >= CREDITOS_NIVELADOS_10_SIS
        return False
