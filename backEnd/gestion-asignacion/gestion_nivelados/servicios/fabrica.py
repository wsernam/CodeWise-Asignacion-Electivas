from .gestor_nivelados_sis import GestorNiveladosSis
from .gestor_nivelados_aut import GestorNiveladosAut    
from .gestor_nivelados_tel import GestorNiveladosTel
from Variables import CODIGO_AUTOMATICA, CODIGO_SISTEMAS, CODIGO_ELECTRONICA

class GestionNiveladosFabrica:
    @staticmethod
    def get_gestor(perfil):
        est_codigo = perfil.est_codigo
        Estudiante = perfil.estudiante #Esto es un mock
        pro_codigo = perfil.pro_codigo

        if pro_codigo == CODIGO_SISTEMAS:
            return GestorNiveladosSis()
        elif pro_codigo == CODIGO_AUTOMATICA:
            return GestorNiveladosAut()
        elif pro_codigo == CODIGO_ELECTRONICA:
            return GestorNiveladosTel()
        else:
            raise ValueError(f"No existe gestor para la carrera con código {pro_codigo}")
