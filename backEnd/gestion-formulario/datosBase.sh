#!/bin/bash
sed -i 's/\r$//' "$0"
# Puedes sobreescribir con ANIO=2025 SEM=2 ./datosBase.sh
export ANIO="${ANIO:-2025}"
export SEM="${SEM:-2}"
echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate
echo "Insertando datos iniciales en la base de datos (FORMULARIO) para periodo ${ANIO}-${SEM}..."
python manage.py shell <<'PYCODE'
import os
from django.db import transaction
from gestion_electivas.models import Programa, Facultad, Electiva
from gestion_estudiantes.models import Estudiante
from gestion_oferta_electiva.models import Oferta_electiva
from seleccion_electivas.models import SeleccionEstudianteElectiva as Seleccion
ANIO = int(os.environ.get("ANIO", "2025"))
SEM  = int(os.environ.get("SEM",  "2"))
# 1) Facultad y programas
fac, _ = Facultad.objects.get_or_create(fac_nombre="Facultad de Ingeniería")
PIS, _  = Programa.objects.get_or_create(pro_codigo="PIS",  defaults={"pro_nombre":"Ingeniería de Sistemas", "fac_codigo":fac})
PIAI, _ = Programa.objects.get_or_create(pro_codigo="PIAI", defaults={"pro_nombre":"Ingeniería Automática",  "fac_codigo":fac})
PIET, _ = Programa.objects.get_or_create(pro_codigo="PIET", defaults={"pro_nombre":"Ingeniería Electrónica", "fac_codigo":fac})
# 2) Electivas (incluye compartidas)
E = {}
E["ELEC001"], _ = Electiva.objects.get_or_create(ele_codigo="ELEC001", defaults={"ele_nombre":"Arquitectura de SW",       "pro_codigo":PIS, "ele_cupos": 20})
E["ELEC002"], _ = Electiva.objects.get_or_create(ele_codigo="ELEC002", defaults={"ele_nombre":"Microservicios",           "pro_codigo":PIS, "ele_cupos": 20})
E["ELEC003"], _ = Electiva.objects.get_or_create(ele_codigo="ELEC003", defaults={"ele_nombre":"Inteligencia de Datos",    "pro_codigo":PIS, "ele_cupos": 20})
E["ELEC101"], _ = Electiva.objects.get_or_create(ele_codigo="ELEC101", defaults={"ele_nombre":"Aplicaciones IoT",        "pro_codigo":PIAI, "ele_cupos": 20})
E["ELEC201"], _ = Electiva.objects.get_or_create(ele_codigo="ELEC201", defaults={"ele_nombre":"Comunicaciones y Datos",  "pro_codigo":PIET, "ele_cupos": 20})
E["COM001"],  _ = Electiva.objects.get_or_create(ele_codigo="COM001",  defaults={"ele_nombre":"Aprendizaje Colaborativo", "pro_codigo":PIS, "ele_cupos": 20})
E["COM002"],  _ = Electiva.objects.get_or_create(ele_codigo="COM002",  defaults={"ele_nombre":"Apps Móviles",             "pro_codigo":PIS, "ele_cupos": 20})
# 3) Oferta del periodo (global: basta con que esté ofertada por algún programa)
def ofertar(ele, prog):
    Oferta_electiva.objects.get_or_create(
        ofe_anio=ANIO, ofe_num_semestre=SEM,
        ele_codigo=ele, pro_codigo=prog
    )
ofertar(E["ELEC001"], PIS)
ofertar(E["ELEC002"], PIS)
ofertar(E["ELEC003"], PIS)
ofertar(E["ELEC101"], PIAI)
ofertar(E["ELEC201"], PIET)
ofertar(E["COM001"],  PIS)
ofertar(E["COM002"],  PIS)
# 4) 20 estudiantes
DEMO = {
    200000000001: ("ANA",        "QUINTERO",    "ana.quintero@unicauca.edu.co",        "PIS"),
    200000000002: ("BRAYAN",     "SUAREZ",      "brayan.suarez@unicauca.edu.co",       "PIS"),
    200000000003: ("CAROLINA",   "BOLAÑOS",     "carolina.bolanos@unicauca.edu.co",    "PIS"),
    200000000004: ("DIEGO",      "MARTINEZ",    "diego.martinez@unicauca.edu.co",      "PIS"),
    200000000005: ("ESTEFANIA",  "MORALES",     "estefania.morales@unicauca.edu.co",   "PIS"),
    200000000006: ("FELIPE",     "CASTRO",      "felipe.castro@unicauca.edu.co",       "PIAI"),
    200000000007: ("GABRIELA",   "RUIZ",        "gabriela.ruiz@unicauca.edu.co",       "PIAI"),
    200000000008: ("HECTOR",     "GOMEZ",       "hector.gomez@unicauca.edu.co",        "PIAI"),
    200000000009: ("IVONNE",     "SANCHEZ",     "ivonne.sanchez@unicauca.edu.co",      "PIAI"),
    200000000010: ("JULIAN",     "TASCON",      "julian.tascon@unicauca.edu.co",       "PIAI"),
    200000000011: ("KAREN",      "ARBOLEDA",    "karen.arboleda@unicauca.edu.co",      "PIET"),
    200000000012: ("LEONARDO",   "MELO",        "leonardo.melo@unicauca.edu.co",       "PIET"),
    200000000013: ("MONICA",     "OROZCO",      "monica.orozco@unicauca.edu.co",       "PIET"),
    200000000014: ("NICOLAS",    "PAZ",         "nicolas.paz@unicauca.edu.co",         "PIET"),
    200000000015: ("OSCAR",      "RIVERA",      "oscar.rivera@unicauca.edu.co",        "PIET"),
    200000000016: ("PAOLA",      "SERNA",       "wsernam@unicauca.edu.co",         "PIS"),
    200000000017: ("QUEEN",      "VALENCIA",    "queen.valencia@unicauca.edu.co",      "PIS"),
    200000000018: ("RAFAEL",     "YELA",        "rafael.yela@unicauca.edu.co",         "PIAI"),
    200000000019: ("SANDRA",     "ZAMBRANO",    "sandra.zambrano@unicauca.edu.co",     "PIET"),
    200000000020: ("TOMAS",      "ZUNIGA",      "tomas.zuniga@unicauca.edu.co",        "PIS"),
    104621011351: ("ESTUDIANTE", "UNO",   "104621011351@unicauca.edu.co", "PIS"),
    100621021344: ("ESTUDIANTE", "DOS",   "100621021344@unicauca.edu.co", "PIS"),
    104621011382: ("ESTUDIANTE", "TRES",  "104621011382@unicauca.edu.co", "PIS"),
    104621011377: ("ESTUDIANTE", "CUATRO","104621011377@unicauca.edu.co", "PIS"),
    100621021365: ("ESTUDIANTE", "CINCO", "100621021365@unicauca.edu.co", "PIS"),
    100621021349: ("ESTUDIANTE", "SEIS",  "100621021349@unicauca.edu.co", "PIS"),
    104621011376: ("ESTUDIANTE", "SIETE", "104621011376@unicauca.edu.co", "PIS"),
    104621011383: ("ESTUDIANTE", "OCHO",  "104621011383@unicauca.edu.co", "PIS"),
    104621021199: ("ESTUDIANTE", "NUEVE", "104621021199@unicauca.edu.co", "PIS"),
}
P_MAP = {"PIS": PIS, "PIAI": PIAI, "PIET": PIET}
def preferencias_para(prog_code):
    if prog_code == "PIS":
        return ["ELEC001", "ELEC002", "COM001", "COM002", "ELEC003"]
    if prog_code == "PIAI":
        return ["ELEC101", "COM001", "COM002", "ELEC001"]
    if prog_code == "PIET":
        return ["ELEC201", "COM001", "COM002", "ELEC001"]
    return ["COM001", "COM002"]
cre_est, cre_sel = 0, 0
with transaction.atomic():
    for est_cod, (nom, ape, email, pc) in DEMO.items():
        prog = P_MAP[pc]
        est, c = Estudiante.objects.get_or_create(
            est_codigo=est_cod,
            defaults={"est_nombre":nom, "est_apellido":ape, "est_correo":email, "pro_codigo":prog}
        )
        if c: cre_est += 1
        prefs = preferencias_para(pc)
        for i, ele_key in enumerate(prefs[:5], start=1):  # P1..P5
            ele = E[ele_key]
            _, cs = Seleccion.objects.get_or_create(
                est_codigo=est,
                sel_anio=ANIO,
                sel_num_semestre=SEM,
                sel_prioridad=i,
                defaults={"ele_codigo": ele}
            )
            if cs: cre_sel += 1
print(f"Estudiantes creados: {cre_est}")
print(f"Selecciones creadas: {cre_sel} (periodo {ANIO}-{SEM})")
# 5) Crear ofertas de formulario (cantidad de electivas por programa)
from gestion_oferta_electiva.models import Oferta_formulario
OF, created1 = Oferta_formulario.objects.get_or_create(
    ofefor_anio=ANIO,
    ofefor_num_semestre=SEM,
    pro_codigo=PIS,
    defaults={"ofefor_cantidad_electivas": 5}
)

OF, created2 = Oferta_formulario.objects.get_or_create(
    ofefor_anio=ANIO,
    ofefor_num_semestre=SEM,
    pro_codigo=PIET,
    defaults={"ofefor_cantidad_electivas": 3}
)

OF, created3 = Oferta_formulario.objects.get_or_create(
    ofefor_anio=ANIO,
    ofefor_num_semestre=SEM,
    pro_codigo=PIAI,
    defaults={"ofefor_cantidad_electivas": 3}
)

PYCODE
echo "==> OK (FORMULARIO)."
# Arranca el servidor
exec "$@"