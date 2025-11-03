from .gestor_nivelados_sis import GestorNiveladosSis
from .gestor_nivelados_aut import GestorNiveladosAut    
from .gestor_nivelados_ele import GestorNiveladosEle
from .variables import CODIGO_AUTOMATICA, CODIGO_SISTEMAS, CODIGO_ELECTRONICA
from referencias.models import Estudiante
from gestion_hojas_de_calculo.models import PerfilAcademico
class GestionNiveladosFabrica:
    @staticmethod
    def get_gestor(perfil:PerfilAcademico):
        est_codigo = perfil.est_codigo.est_codigo
        estudiante = Estudiante.objects.get(est_codigo=est_codigo)
        pro_codigo = estudiante.pro_codigo.pro_codigo

        if pro_codigo == CODIGO_SISTEMAS:
            return GestorNiveladosSis()
        elif pro_codigo == CODIGO_AUTOMATICA:
            return GestorNiveladosAut()
        elif pro_codigo == CODIGO_ELECTRONICA:
            return GestorNiveladosEle()
        else:
            raise ValueError(f"No existe gestor para la carrera con código {pro_codigo}")
