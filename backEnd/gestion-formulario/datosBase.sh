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

# ===============================
# PIAI
# ===============================
E["ELEC401"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC401",
    defaults={
        "ele_nombre": "Aplicaciones industriales IoT",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC402"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC402",
    defaults={
        "ele_nombre": "Bioingeniería: Rehabilitación",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC403"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC403",
    defaults={
        "ele_nombre": "Bioingeniería: robótica quirúrgica y asistencial",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC404"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC404",
    defaults={
        "ele_nombre": "Circuitos Electrónicos para Sistemas IoT",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC405"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC405",
    defaults={
        "ele_nombre": "Energías Renovables",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC406"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC406",
    defaults={
        "ele_nombre": "Modelado de sistemas integrados de producción",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC407"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC407",
    defaults={
        "ele_nombre": "Programación Avanzada de PLC's",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC408"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC408",
    defaults={
        "ele_nombre": "Seguridad de sistemas de automatización industrial",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC409"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC409",
    defaults={
        "ele_nombre": "Sistemas electrónicos de potencia",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)
E["ELEC410"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC410",
    defaults={
        "ele_nombre": "Visión de Máquina",
        "pro_codigo": PIAI,
        "ele_cupos": 5,
    },
)

# ===============================
# PIET
# ===============================
E["ELEC501"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC501",
    defaults={
        "ele_nombre": "Arquitectura para el despliegue de servicios",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC502"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC502",
    defaults={
        "ele_nombre": "Desarrollo de Aplicaciones Móviles",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC503"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC503",
    defaults={
        "ele_nombre": "Desarrollo de aplicaciones para sistemas ubicuos",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC504"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC504",
    defaults={
        "ele_nombre": "Desarrollo de Aplicaciones Web",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC505"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC505",
    defaults={
        "ele_nombre": "Recent Topics In Networking",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC506"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC506",
    defaults={
        "ele_nombre": "Redes de Nueva Generación",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC507"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC507",
    defaults={
        "ele_nombre": "Redes Ópticas Avanzadas",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC508"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC508",
    defaults={
        "ele_nombre": "Seguridad en Redes de Información",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC509"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC509",
    defaults={
        "ele_nombre": "Sistemas de Comunicaciones por Fibra Óptica",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC510"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC510",
    defaults={
        "ele_nombre": "Sistemas Inalámbricos en la Comunicación de Datos",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC511"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC511",
    defaults={
        "ele_nombre": "Technologies for Smart Cities",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC512"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC512",
    defaults={
        "ele_nombre": "Técnicas de Transmisión Avanzadas en Com. Inalámbricas",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC513"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC513",
    defaults={
        "ele_nombre": "TIC En Salud y Salud Móvil",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)
E["ELEC514"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC514",
    defaults={
        "ele_nombre": "Web Social",
        "pro_codigo": PIET,
        "ele_cupos": 5,
    },
)

# ===============================
# PIS
# ===============================
E["ELEC601"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC601",
    defaults={
        "ele_nombre": "Aplicaciones de la inteligencia artificial generativa",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC602"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC602",
    defaults={
        "ele_nombre": "Aprendizaje Colaborativo Asistido por Computador",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC603"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC603",
    defaults={
        "ele_nombre": "Arquitectura de la información para ambientes digitales",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC604"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC604",
    defaults={
        "ele_nombre": "Arquitectura de Microservicios",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC605"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC605",
    defaults={
        "ele_nombre": "Arquitecturas SW para Aplicaciones Empresariales (ASAE)",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC606"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC606",
    defaults={
        "ele_nombre": "Bodegas de Datos",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC607"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC607",
    defaults={
        "ele_nombre": "Conceptos Avanzados de Bases de Datos",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC608"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC608",
    defaults={
        "ele_nombre": "Desarrollo de Aplicaciones para la Web Semántica de IoT (SWoT)",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC609"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC609",
    defaults={
        "ele_nombre": "Desarrollo de Soluciones Educativas",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC610"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC610",
    defaults={
        "ele_nombre": "Desarrollo de Videojuegos",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC611"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC611",
    defaults={
        "ele_nombre": "Fundamentos de Computación Evolutiva",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC612"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC612",
    defaults={
        "ele_nombre": "Fundamentos de Metaheurísticas",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC613"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC613",
    defaults={
        "ele_nombre": "Informática Forense",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC614"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC614",
    defaults={
        "ele_nombre": "Ingeniería de Procesos de Software",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC615"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC615",
    defaults={
        "ele_nombre": "Ingeniería de Requisitos",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC616"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC616",
    defaults={
        "ele_nombre": "Inteligencia de Datos",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC617"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC617",
    defaults={
        "ele_nombre": "Interacción Humano Computador (HCI)",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC618"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC618",
    defaults={
        "ele_nombre": "Introducción a la Criptografía",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC619"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC619",
    defaults={
        "ele_nombre": "Introducción a la Minería de Datos",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC620"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC620",
    defaults={
        "ele_nombre": "Seguridad Informática",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC621"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC621",
    defaults={
        "ele_nombre": "Sistemas de Recuperación de Imágenes Basadas en Contenido (SCBIR)",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC622"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC622",
    defaults={
        "ele_nombre": "Taller de Metodologías Ágiles",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)
E["ELEC623"], _ = Electiva.objects.get_or_create(
    ele_codigo="ELEC623",
    defaults={
        "ele_nombre": "Tópicos Avanzados en Ingeniería de Software",
        "pro_codigo": PIS,
        "ele_cupos": 5,
    },
)

# 3) Oferta del periodo (global: basta con que esté ofertada por algún programa)
def ofertar(ele, prog):
    Oferta_electiva.objects.get_or_create(
        ofe_anio=ANIO, ofe_num_semestre=SEM,
        ele_codigo=ele, pro_codigo=prog
    )
# === Oferta PIAI ===
ofertar(E["ELEC401"], PIAI)  # Aplicaciones industriales IoT
ofertar(E["ELEC402"], PIAI)  # Bioingeniería: Rehabilitación
ofertar(E["ELEC405"], PIAI)  # Energías Renovables
#ofertar(E["ELEC407"], PIAI)  # Programación Avanzada de PLC's
#ofertar(E["ELEC410"], PIAI)  # Visión de Máquina

# === Oferta PIET ===
ofertar(E["ELEC502"], PIET)  # Desarrollo de Aplicaciones Móviles
ofertar(E["ELEC504"], PIET)  # Desarrollo de Aplicaciones Web
ofertar(E["ELEC505"], PIET)  # Recent Topics In Networking
ofertar(E["ELEC506"], PIET)  # Redes de Nueva Generación
ofertar(E["ELEC507"], PIET)  # Redes Ópticas Avanzadas
ofertar(E["ELEC508"], PIET)  # Seguridad en Redes de Información
#ofertar(E["ELEC510"], PIET)  # Sistemas Inalámbricos en la Comunicación de Datos
#ofertar(E["ELEC514"], PIET)  # Web Social

# === Oferta PIS ===
ofertar(E["ELEC602"], PIS)  # Aprendizaje Colaborativo Asistido por Computador
ofertar(E["ELEC604"], PIS)  # Arquitectura de Microservicios
ofertar(E["ELEC605"], PIS)  # Arquitecturas SW para Aplicaciones Empresariales (ASAE)
ofertar(E["ELEC607"], PIS)  # Conceptos Avanzados de Bases de Datos
ofertar(E["ELEC608"], PIS)  # Desarrollo de Aplicaciones para la Web Semántica de IoT (SWoT)
ofertar(E["ELEC611"], PIS)  # Fundamentos de Computación Evolutiva
ofertar(E["ELEC614"], PIS)  # Ingeniería de Procesos de Software
ofertar(E["ELEC616"], PIS)  # Inteligencia de Datos
ofertar(E["ELEC619"], PIS)  # Introducción a la Minería de Datos
#ofertar(E["ELEC621"], PIS)  # Sistemas de Recuperación de Imágenes Basadas en Contenido (SCBIR)
#ofertar(E["ELEC622"], PIS)  # Taller de Metodologías Ágiles

# 4) 20 estudiantes
DEMO = {
    104621011351: ("BRAYAN CAMILO", "HERRERA MEDINA", "bherrera@unicauca.edu.co", "PIS"),
    100621021344: ("VALERIA", "PINO RIVERA", "vpino@unicauca.edu.co", "PIET"),
    104621011382: ("KEVIN ALEJANDRO", "ERASO MEDINA", "kerasom@unicauca.edu.co", "PIS"),
    104621011377: ("KATHERIN ALEXANDRA", "ZUÑIGA MORALES", "kzunigam@unicauca.edu.co", "PIS"),
    100621021365: ("JUAN DIEGO", "ROSERO BENAVIDES", "juandrosero@unicauca.edu.co", "PIET"),
    100621021349: ("JUAN DIEGO", "MORALES POLANCO", "juandamorales@unicauca.edu.co", "PIET"),
    104621011376: ("DAVID SANTIAGO", "FERNÁNDEZ DEJOY", "dfernandezd@unicauca.edu.co", "PIS"),
    104621011383: ("JEFERSON", "CASTAÑO OSSA", "jcastanoossa@unicauca.edu.co", "PIS"),
    104621021199: ("VALERIA", "BASTIDAS TORRES", "valeriabastidas@unicauca.edu.co", "PIS"),
    100621011439: ("ISABELLA", "PLAZA DIAZ", "iplaza@unicauca.edu.co", "PIET"),
    46102080: ("ROBY ANDERSON", "PÉREZ HOYOS", "robyperez@unicauca.edu.co", "PIET"),
    104621011361: ("ANDRÉS", "TORRES CICERI", "andrestorresc@unicauca.edu.co", "PIS"),
    104621011350: ("JUAN SEBASTIAN", "ROSERO MEDINA", "jroserom@unicauca.edu.co", "PIS"),
    100620011843: ("JUAN ESTEBAN", "MARTINEZ SANDOVAL", "juanemartinez@unicauca.edu.co", "PIET"),
    100621021407: ("CAMILO ANDRÉS", "MUÑOZ QUINAYAS", "cmunozq@unicauca.edu.co", "PIET"),
    100621011442: ("YONNY ORLANDO", "CAJAS HOYOS", "ycajas@unicauca.edu.co", "PIET"),
    104621021330: ("DUBER ANDRES", "ERASO UNI", "dubereraso@unicauca.edu.co", "PIS"),
    100622021314: ("SOPHIA", "DIAGO MOSQUERA", "sofidiago@unicauca.edu.co", "PIET"),
    100622011509: ("LAURA VALENTINA", "MOSQUERA JIMÉNEZ", "lauravmosquera@unicauca.edu.co", "PIET"),
    100617020835: ("NICOLAS", "SANCHEZ PEREA", "nicolassp@unicauca.edu.co", "PIET"),
    104621011395: ("JONATHAN FELIPE", "HURTADO DÍAZ", "jfhurtadod@unicauca.edu.co", "PIS"),
    104720011905: ("KAREN DAYANA", "TITIMBO GALEANO", "ktitimbo@unicauca.edu.co", "PIAI"),
    104620011813: ("CARLOS MARIO", "PERDOMO RAMOS", "cmperdomo@unicauca.edu.co", "PIS"),
    104622011455: ("JORGE ANDRÉS", "MARTINEZ VARÓN", "jorgeandre@unicauca.edu.co", "PIS"),
    104622011428: ("JHOAN DAVID", "CHACÓN MORÁN", "jhoanchacon@unicauca.edu.co", "PIS"),
    104622011422: ("JONATHAN DAVID", "GUEJIA BURBANO", "jonathanguejia@unicauca.edu.co", "PIS"),
    104621021186: ("MIGUEL ANGEL", "POLO GOMEZ", "mpolo@unicauca.edu.co", "PIS"),
    104719021442: ("JOHANN LEONEL", "FERNANDEZ FLOREZ", "jofernandez@unicauca.edu.co", "PIAI"),
    104622011458: ("ISABELA", "SANCHEZ SAAVEDRA", "isanchez@unicauca.edu.co", "PIS"),
    104620011777: ("DANIEL FERNANDO", "SOLARTE ORTEGA", "dfsolarte@unicauca.edu.co", "PIS"),
    104621021192: ("LISETH DAYANA", "RIVERA GRANADA", "lisethrivera@unicauca.edu.co", "PIS"),
    100621021346: ("DIEGO FELIPE", "RODRIGUEZ MUÑOZ", "diegofrodriguez@unicauca.edu.co", "PIET"),
    104721011546: ("VALENTINA JISELE", "LOPEZ GUTIERREZ", "vjlopez@unicauca.edu.co", "PIAI"),
    104720011897: ("FRANCISCO JAVIER", "ERAZO VILLARREAL", "ferazov@unicauca.edu.co", "PIAI"),
    104722011540: ("CHRISTIAN DAVID", "BRAVO MUÑOZ", "christiandbravo@unicauca.edu.co", "PIAI"),
    104619011232: ("HAMILTON EFRAIN", "PIPICANO ALVAREZ", "hpipicano@unicauca.edu.co", "PIS"),
    100621021390: ("JOSE MARTIN", "GONZALEZ JOAQUI", "josegonzalez@unicauca.edu.co", "PIET"),
    104621011362: ("JUAN CAMILO", "RODALLEGA MERA", "jrodallega@unicauca.edu.co", "PIS"),
    100619021366: ("WINSTON GANDHI", "GUACA CERON", "wgguaca@unicauca.edu.co", "PIET"),
    104723010291: ("JOSE LUIS", "BRAVO BOLAÑOS", "joselbravo@unicauca.edu.co", "PIAI"),
    104621011364: ("EIDER YESID", "OBANDO", "eyobando@unicauca.edu.co", "PIS"),
    104722021368: ("KAREN SOFIA", "GIL ASTAIZA", "karensg@unicauca.edu.co", "PIAI"),
    104722021342: ("ANDRES FELIPE", "CANTERO MOSQUERA", "afcantero@unicauca.edu.co", "PIAI"),
    104722021343: ("JUAN CARLOS", "CORAL TULCAN", "jccoral@unicauca.edu.co", "PIAI"),
    104722011550: ("JOSE ALEJANDRO", "AROS BURGOS", "josearos@unicauca.edu.co", "PIAI"),
    104621021329: ("SANTIAGO ALEXANDER", "DORADO GOMEZ", "santidorado@unicauca.edu.co", "PIS"),
    104722021370: ("YESSENIA", "PRECIADO MICOLTA", "yesseniap@unicauca.edu.co", "PIAI"),
    104621011360: ("JUAN CARLOS", "FERNANDEZ CUETIA", "jcfernandezc@unicauca.edu.co", "PIS"),
    104620011806: ("CARLOS SANTIAGO", "BALCAZAR VELASQUEZ", "csbalcazar@unicauca.edu.co", "PIS"),
    100621021347: ("EVELIN NAYELI", "ORTIZ CABRERA", "evelinortiz@unicauca.edu.co", "PIET"),
    104618011483: ("MARIA PAULA", "BARRERA MUÑOZ", "mariapaulabm09@unicauca.edu.co", "PIS"),
    100621021358: ("JUAN CAMILO", "LÓPEZ MORILLO", "juancalopez@unicauca.edu.co", "PIET"),
    104621011380: ("JESÚS GABRIEL", "PARRA DUGARTE", "jgparra@unicauca.edu.co", "PIS"),
    104616011334: ("ADRIAN CAMILO", "TORRES GOMEZ", "adriantor@unicauca.edu.co", "PIS"),
    104622011441: ("JULIAN ALEJANDRO", "MUÑOZ PEREZ", "julianalejom@unicauca.edu.co", "PIS"),
    104620011802: ("RICHARD ALEXANDER", "ROBLES LOMAS", "rrobles@unicauca.edu.co", "PIS"),
    104621021183: ("MARY LUZ", "MONTENEGRO COTACIO", "marymontenegro@unicauca.edu.co", "PIS"),
    100621021363: ("CAMILO ANDRÉS", "LLANTÉN CASTRILLÓN", "camillanten@unicauca.edu.co", "PIET"),
    104619021300: ("FREDDY DANIEL", "BOTIA CALLE", "fdbotia@unicauca.edu.co", "PIS"),
    104619021355: ("HAROLD ANDRES", "MOLANO ROSERO", "hmolano@unicauca.edu.co", "PIS"),
    104622011410: ("ISABELA", "MOSQUERA FERNÁNDEZ", "isabelamosquera@unicauca.edu.co","PIS"),
    100621011436: ("FABIO ANDRES", "VALENCIA MARTINEZ", "fvalenciam@unicauca.edu.co", "PIET"),
    104619021335: ("JUAN CARLOS", "MELO BURBANO", "jcmelo@unicauca.edu.co", "PIS"),
    100619021370: ("FRANCISCO DAVID", "PINO MAMIAN", "fdpino@unicauca.edu.co", "PIET"),
    104618011521: ("JHONMARO", "CAMPO IPIA", "jhonmaro@unicauca.edu.co", "PIS"),
    104619011218: ("LEDY MAYERLY", "ASTUDILLO CALDERON", "lmastudillo@unicauca.edu.co", "PIS"),
    104620011817: ("JOAN SEBASTIAN", "TUQUERREZ GOMEZ", "jtuquerrez@unicauca.edu.co", "PIS"),
    104721021255: ("WILSON ANTONIO", "GUASCA IPIALES", "wguasca@unicauca.edu.co", "PIAI"),
    100621011414: ("GUSTAVO ADOLFO", "SANDOVAL MESIAS", "gsandovalm@unicauca.edu.co", "PIET"),
    104722011529: ("DAYANA LUCIA", "ZUÑIGA CERON", "dayzuniga@unicauca.edu.co", "PIAI"),
    104619021334: ("RODRIGO ALEJANDRO", "GUSPIAN PEREZ", "rguspian@unicauca.edu.co", "PIS"),
    104621011507: ("PAULO CESAR", "CHAMORRO MOROS", "paulochamorro@unicauca.edu.co", "PIS"),
    104621011394: ("ALVARO JAVIER", "ARROYO YEPES", "aarroyo@unicauca.edu.co", "PIS"),
    104621021202: ("JUAN DAVID", "BURGOS ARTURO", "juandavidburgos@unicauca.edu.co", "PIS"),
    104619011200: ("JUAN CARLOS", "MANQUILLO TIBANTA", "jucmanquillo@unicauca.edu.co", "PIS"),
    104621011353: ("JANIER YULDER", "GOMEZ GALINDEZ", "jygomezg@unicauca.edu.co", "PIS"),
    100620011882: ("JUAN ESTEBAN", "URBANO CORDOBA", "juaneurbano@unicauca.edu.co", "PIET"),
    100621021372: ("MIGUEL ÁNGEL", "MALDONADO BAUTISTA", "mmaldonado@unicauca.edu.co", "PIET"),
    100621011437: ("MIGUEL ANGEL", "MUÑOZ GARCIA", "miguelmunozg@unicauca.edu.co", "PIET"),
    100622021318: ("SEBASTIAN", "TORRES RAMIREZ", "sebaramirz@unicauca.edu.co", "PIET"),
    100618021286: ("DAVID ALEJANDRO", "GUERRERO WALTEROS", "davidwal@unicauca.edu.co", "PIET"),
    104620011820: ("WILLIAM ANDRES", "SERNA MUÑOZ", "wsernam@unicauca.edu.co", "PIS"),
    100618021265: ("KEVIN SANTIAGO", "OLIVEROS REALPE", "orkevin@unicauca.edu.co", "PIET"),
    100619021359: ("ANGIE TATIANA", "PEREZ MUÑOZ", "antaperez@unicauca.edu.co", "PIET"),
    104721021228: ("DANIEL ALEJANDRO", "RUANO BUSTOS", "danielruano@unicauca.edu.co", "PIAI"),
    104622011460: ("SANTIAGO", "RODRIGUEZ BOLAÑOS", "santiagorbolanos@unicauca.edu.co", "PIS"),
    104721011549: ("ANGIE VANESSA", "LÓPEZ DULCE", "avlopez@unicauca.edu.co", "PIAI"),
    104721011545: ("YORDAN YEFERSON", "VILLOTA ORTEGA", "yvillota@unicauca.edu.co", "PIAI"),
    104721011519: ("ENRIQUE STIVEN", "PABON JIMENEZ", "espabon@unicauca.edu.co", "PIAI"),
    104621011508: ("DAVID SANTIAGO", "GIRÓN MUÑOZ", "davidgiron@unicauca.edu.co", "PIS"),
    104721011523: ("NATALIA ALEJANDRA", "VERA SARRIA", "nataliavera@unicauca.edu.co", "PIAI"),
    104721011544: ("AURA MARIA", "PAQUE SANDOVAL", "apaque@unicauca.edu.co", "PIAI"),
    104720011912: ("CRISTIAN MATEO", "CASTRO PERFETTI", "cmcastro@unicauca.edu.co", "PIAI"),
    104721011540: ("ANA MARÍA", "PEREZ FIGUEROA", "anamperez@unicauca.edu.co", "PIAI"),
    104621021212: ("JUAN SEBASTIAN", "PISSO SOLARTE", "jpisso@unicauca.edu.co", "PIS"),
    100618021264: ("DIEGO ALBERTO", "PINZÓN MUÑOZ", "diegopinzon@unicauca.edu.co", "PIET"),
    104722011518: ("ANDRES FELIPE", "COLLAZOS PÉREZ", "andrescollazos@unicauca.edu.co", "PIAI"),
    104621021189: ("MARÍA CAMILA", "HOYOS GÓMEZ", "mariahoyos@unicauca.edu.co", "PIS"),
    100619021387: ("JUAN ESTEBAN", "HAMDAN GIRALDO", "jueshamdan@unicauca.edu.co", "PIET"),
    100616011397: ("STEVEN ALEJANDRO", "MAMIAN IMBACHI", "stevenmam@unicauca.edu.co", "PIET"),
    104621011506: ("JULIAN ANDRES", "FLOREZ CAMPO", "julianflorezc@unicauca.edu.co", "PIS"),
    100618021260: ("YULI FERNANDA", "MEDINA CORDOBA", "yfmedina@unicauca.edu.co", "PIET"),
    104721021253: ("MIGUEL STIVEN", "HERNANDEZ MENDIETA", "miguelhernandez@unicauca.edu.co", "PIAI"),
    104621021171: ("JEISON ANDRÉS", "VALLEJO GÓMEZ", "jeisonvallejo@unicauca.edu.co", "PIS"),
    100621011416: ("LARY MARIANA", "BETANCOURT AVILA", "lmbetancourt@unicauca.edu.co", "PIET"),
    100621011408: ("LAURA SOFÍA", "SÁNCHEZ BOLAÑOS", "lsanchezb@unicauca.edu.co", "PIET"),
    104620011799: ("CRISTIAN DAVID", "QUINAYAS RIVERA", "crquinayas@unicauca.edu.co", "PIS"),
    100619011045: ("MIGUEL ANTONIO", "QUEVEDO PANTOJA", "mquevedo@unicauca.edu.co", "PIET"),
    104619011204: ("JUAN ESTEBAN", "RUIZ BENAVIDES", "jesruiz@unicauca.edu.co", "PIS"),
    104622011459: ("MÓNICA ALEJANDRA", "CASTELLANOS MÉNDEZ", "monicacastellanos@unicauca.edu.co", "PIS"),
    104617021653: ("AYMER CAMILO", "ORTIZ PULIDO", "aymercsamilo@unicauca.edu.co", "PIET"),
    104621011388: ("HAROLD ANDRES", "VELASQUEZ TOBAR", "hvelasquez@unicauca.edu.co", "PIS"),
    104621011345: ("CARLOS MARIO", "VIVAS GARCÍA", "cvivasg@unicauca.edu.co", "PIS"),
    104621021222: ("SHARYTH YALINY", "VELASCO DIAZ", "sharythvelasco@unicauca.edu.co", "PIS"),
    104716010968: ("DEIMAR", "QUIÑONES RUIZ", "qdeimar@unicauca.edu.co", "PIAI"),
    104621011375: ("VALENTINA", "FERNÁNDEZ GUERRERO", "vfernandezg@unicauca.edu.co", "PIS"),
    104722011552: ("DUBAN ALEJANDRO", "ZEMANATE RENGIFO", "dzemanater@unicauca.edu.co", "PIAI"),
    100622011482: ("GILBERTO ADOLFO", "PLAZAS TRUJILLO", "gilbertoplazas@unicauca.edu.co", "PIET"),
    100619021407: ("CARLOS HERNAN", "CUAJI SALINAS", "carloscuaji@unicauca.edu.co", "PIET"),
    104720011923: ("RONALD SANTIAGO", "BASTIDAS CERQUERA", "rbastidasc@unicauca.edu.co", "PIAI"),
    104621011370: ("JUAN ESTEBAN", "YEPEZ RODRIGUEZ", "jyepezr@unicauca.edu.co", "PIS"),
    104618021305: ("JUAN CAMILO", "SARABINO ALEGRIA", "jsarabino@unicauca.edu.co", "PIS"),
    100621021377: ("OSCAR STYBEN", "MATABAJOY NARVAEZ", "omatabajoy@unicauca.edu.co", "PIET"),
    100618021266: ("ALEJANDRO", "PRIETO CARDONA", "aprieto@unicauca.edu.co", "PIET"),
    100622011495: ("JUAN DAVID", "GUTIERREZ MUÑOZ", "jdgutierrezm@unicauca.edu.co", "PIET"),
    100621021361: ("JUAN JOSE ANGEL", "DURÁN CALVACHE", "joseduran@unicauca.edu.co", "PIET"),
    104620011815: ("DUVAN FELIPE", "ARMERO CUARAN", "duvanfeli@unicauca.edu.co", "PIS"),
    104721011514: ("KAREN VANESSA", "SAMBONI RUANO", "karensamboni@unicauca.edu.co", "PIAI"),
    104721011517: ("DARLEY SANTIAGO", "JEMBUEL TEJADA", "djembuel@unicauca.edu.co", "PIAI"),
    100616010749: ("CAMILA ANDREA", "SOTELO CRUZ", "scamila@unicauca.edu.co", "PIET"),
    100618011555: ("DUBAN SMITH", "CASTRO POTOSI", "dubanpoto@unicauca.edu.co", "PIET"),
    100617020845: ("DUBER ELIAN", "MUÑOZ MEZA", "dubermum@unicauca.edu.co", "PIET"),
    100621011511: ("JHON SEBASTIÁN", "DÍAZ CAICEDO", "jhonsdiaz@unicauca.edu.co", "PIET"),
    100620011831: ("ANDRES FELIPE", "BUITRON SAMBONI", "afbuitron@unicauca.edu.co", "PIET"),
    100621011413: ("CARLOS DANIEL", "CUELLAR ANTURY", "cdcuellar@unicauca.edu.co", "PIET"),
    100621021348: ("VANESSA ALEJANDRA", "BENAVIDES ROSERO", "vbenavides@unicauca.edu.co", "PIET"),
    100620011888: ("BRANDON DAVID", "ORTEGA GOYES", "bortegag@unicauca.edu.co", "PIET"),
    104618021304: ("CESAR", "PAZ PAYAN", "cesarpaz@unicauca.edu.co", "PIS"),
    100621011441: ("FARID SANTIAGO", "CARVAJAL MORALES", "fscarvajalm@unicauca.edu.co", "PIET"),
    104621011374: ("MANUEL FELIPE", "PAZ VIDAL", "manuelpazv@unicauca.edu.co", "PIS"),
    104722011541: ("JUAN DAVID", "VALDEZ SOLARTE", "juanvaldez@unicauca.edu.co", "PIAI"),
    100621011402: ("CARLOS DANIEL", "COLLAZOS ZAMBRANO", "cdcollazos@unicauca.edu.co", "PIET"),
    104621021200: ("LAURA SOFIA", "BOTINA MONTERO", "laubotina@unicauca.edu.co", "PIS"),
    100610011032: ("SANTIAGO", "LASSO TORRES", "santiagolasso@unicauca.edu.co", "PIET"),
    104617011703: ("DIEGO ALEJANDRO", "PIAMBA ESCOBAR", "diegopes@unicauca.edu.co", "PIS"),
    104619011185: ("JUAN CAMILO", "ZARTA CAMPO", "jzarta@unicauca.edu.co", "PIS"),
    104720011915: ("MARIA VALENTINA", "MONCAYO JURADO", "mmoncayoj@unicauca.edu.co", "PIAI"),
    100618011110: ("ELKIN ALEJANDRO", "LEDESMA NARVAEZ", "elkinal@unicauca.edu.co", "PIET"),
    104618010034: ("GERALDINE IVONNE", "CARLOSAMA MOREANO", "geralmore@unicauca.edu.co", "PIS"),
    104621011385: ("ANDRES FELIPE", "COLLAZOS FERNÁNDEZ", "afcollazosf@unicauca.edu.co", "PIS"),
}
P_MAP = {
    "PIAI": PIAI,
    "PIET": PIET,
    "PIS": PIS,
}
PREFERENCIAS_ESTUDIANTES = {
    104621011351: ["ELEC604", "ELEC605", "ELEC602", "ELEC607", "ELEC622", "ELEC614", "ELEC621", "ELEC619"],
    100621021344: ["ELEC507", "ELEC510", "ELEC506"],
    104621011382: ["ELEC604", "ELEC616", "ELEC611", "ELEC605", "ELEC602"],
    104621011377: ["ELEC607", "ELEC602", "ELEC622", "ELEC605"],
    100621021365: ["ELEC510", "ELEC506"],
    100621021349: ["ELEC510", "ELEC504", "ELEC502", "ELEC508", "ELEC602"],
    104621011376: ["ELEC607", "ELEC605", "ELEC602", "ELEC622"],
    104621011383: ["ELEC607", "ELEC602", "ELEC611", "ELEC616", "ELEC614"],
    104621021199: ["ELEC619", "ELEC607", "ELEC611", "ELEC616", "ELEC605", "ELEC604", "ELEC622", "ELEC621"],
    100621011439: ["ELEC507", "ELEC504", "ELEC508", "ELEC502", "ELEC514"],
    46102080: ["ELEC602", "ELEC614", "ELEC604", "ELEC622", "ELEC611", "ELEC616", "ELEC619", "ELEC605"],
    104621011361: ["ELEC619", "ELEC604", "ELEC607", "ELEC614", "ELEC621", "ELEC616", "ELEC602", "ELEC622"],
    104621011350: ["ELEC605", "ELEC604", "ELEC607", "ELEC622", "ELEC619", "ELEC616", "ELEC602"],
    100620011843: ["ELEC510", "ELEC507", "ELEC504", "ELEC514", "ELEC505"],
    100621021407: ["ELEC507", "ELEC506", "ELEC510"],
    100621011442: ["ELEC504", "ELEC502", "ELEC514"],
    104621021330: ["ELEC604", "ELEC605", "ELEC607", "ELEC619", "ELEC622", "ELEC602", "ELEC616", "ELEC611"],
    100622021314: ["ELEC506", "ELEC507"],
    100622011509: ["ELEC506", "ELEC507"],
    100617020835: ["ELEC602", "ELEC502", "ELEC514"],
    104621011395: ["ELEC619", "ELEC604", "ELEC605", "ELEC622", "ELEC614", "ELEC607", "ELEC616", "ELEC602"],
    104720011905: ["ELEC407", "ELEC508", "ELEC401", "ELEC602", "ELEC410"],
    104620011813: ["ELEC616", "ELEC605", "ELEC604", "ELEC619", "ELEC608", "ELEC614", "ELEC607", "ELEC602"],
    104622011455: ["ELEC604", "ELEC605", "ELEC622", "ELEC608", "ELEC619", "ELEC616", "ELEC607", "ELEC602"],
    104622011428: ["ELEC604", "ELEC605", "ELEC622", "ELEC608", "ELEC619", "ELEC616", "ELEC607", "ELEC602"],
    104622011422: ["ELEC604", "ELEC605", "ELEC622", "ELEC608", "ELEC619", "ELEC616", "ELEC607", "ELEC602"],
    104621021186: ["ELEC616", "ELEC608", "ELEC619", "ELEC607", "ELEC602", "ELEC621", "ELEC604", "ELEC622"],
    104719021442: ["ELEC407", "ELEC405", "ELEC401", "ELEC410", "ELEC508"],
    104622011458: ["ELEC622", "ELEC616", "ELEC607", "ELEC619", "ELEC611", "ELEC605", "ELEC614", "ELEC604"],
    104620011777: ["ELEC605", "ELEC604", "ELEC616", "ELEC619", "ELEC607", "ELEC621", "ELEC611", "ELEC608"],
    104621021192: ["ELEC619", "ELEC616", "ELEC614", "ELEC607"],
    100621021346: ["ELEC507", "ELEC506", "ELEC502", "ELEC508", "ELEC505"],
    104721011546: ["ELEC410", "ELEC602", "ELEC514", "ELEC401", "ELEC504"],
    104720011897: ["ELEC407", "ELEC508", "ELEC405", "ELEC410", "ELEC401"],
    104722011540: ["ELEC405", "ELEC508", "ELEC401", "ELEC407", "ELEC504"],
    104619011232: ["ELEC622", "ELEC607", "ELEC619", "ELEC608", "ELEC605", "ELEC619", "ELEC604"],
    100621021390: ["ELEC505", "ELEC502", "ELEC504", "ELEC602", "ELEC508"],
    104621011362: ["ELEC604", "ELEC605", "ELEC607", "ELEC608", "ELEC614", "ELEC622", "ELEC611", "ELEC621"],
    100619021366: ["ELEC506", "ELEC508", "ELEC504"],
    104723010291: ["ELEC401", "ELEC407", "ELEC508", "ELEC402"],
    104621011364: ["ELEC619", "ELEC616", "ELEC604", "ELEC614", "ELEC611", "ELEC602", "ELEC621", "ELEC607"],
    104722021368: ["ELEC402", "ELEC401", "ELEC410", "ELEC407", "ELEC405"],
    104722021342: ["ELEC407", "ELEC401", "ELEC402", "ELEC508"],
    104722021343: ["ELEC401", "ELEC407", "ELEC402", "ELEC508", "ELEC410"],
    104722011550: ["ELEC407", "ELEC508", "ELEC401", "ELEC410", "ELEC505"],
    104621021329: ["ELEC605", "ELEC604", "ELEC607", "ELEC619", "ELEC622", "ELEC608", "ELEC611", "ELEC616"],
    104722021370: ["ELEC402", "ELEC407", "ELEC505"],
    104621011360: ["ELEC619", "ELEC604", "ELEC605", "ELEC622", "ELEC614", "ELEC607", "ELEC616", "ELEC602"],
    104620011806: ["ELEC619", "ELEC604", "ELEC605", "ELEC622", "ELEC614", "ELEC607", "ELEC616", "ELEC602"],
    100621021347: ["ELEC507", "ELEC504", "ELEC506", "ELEC502", "ELEC505"],
    104618011483: ["ELEC619", "ELEC607", "ELEC605", "ELEC622", "ELEC621", "ELEC602", "ELEC608", "ELEC614"],
    100621021358: ["ELEC504", "ELEC505", "ELEC502", "ELEC510", "ELEC514"],
    104621011380: ["ELEC619", "ELEC614", "ELEC607", "ELEC621", "ELEC604", "ELEC605", "ELEC622", "ELEC602"],
    104616011334: ["ELEC605", "ELEC604"],
    104622011441: ["ELEC605", "ELEC604", "ELEC619", "ELEC622", "ELEC607", "ELEC611", "ELEC602", "ELEC616"],
    104620011802: ["ELEC607", "ELEC602", "ELEC604", "ELEC614", "ELEC605", "ELEC619", "ELEC616", "ELEC611"],
    104621021183: ["ELEC616", "ELEC614", "ELEC619", "ELEC607", "ELEC611", "ELEC621", "ELEC604", "ELEC602"],
    100621021363: ["ELEC505", "ELEC502", "ELEC504", "ELEC508", "ELEC510"],
    104621021183: ["ELEC616", "ELEC614", "ELEC619", "ELEC607", "ELEC621", "ELEC611", "ELEC604", "ELEC602"],
    104619021300: ["ELEC605", "ELEC604", "ELEC607", "ELEC616", "ELEC614", "ELEC621", "ELEC619", "ELEC622"],
    104619021355: ["ELEC607", "ELEC622", "ELEC616", "ELEC604", "ELEC619", "ELEC608", "ELEC605", "ELEC614"],
    104622011410: ["ELEC622", "ELEC616", "ELEC607", "ELEC619", "ELEC611", "ELEC605", "ELEC614", "ELEC604"],
    104722021343: ["ELEC401", "ELEC407", "ELEC402", "ELEC410", "ELEC508"],
    104722021368: ["ELEC402", "ELEC410", "ELEC401", "ELEC407", "ELEC405"],
    100621011436: ["ELEC502", "ELEC504", "ELEC514", "ELEC505", "ELEC510"],
    104619021335: ["ELEC619", "ELEC604", "ELEC605", "ELEC607", "ELEC616", "ELEC608", "ELEC614", "ELEC611"],
    100619021370: ["ELEC602", "ELEC505", "ELEC506", "ELEC504", "ELEC502"],
    104618011521: ["ELEC604", "ELEC619", "ELEC602", "ELEC605", "ELEC611", "ELEC616", "ELEC622", "ELEC607"],
    104619011218: ["ELEC605", "ELEC604"],
    104620011817: ["ELEC605", "ELEC604", "ELEC608", "ELEC616", "ELEC622", "ELEC614", "ELEC611", "ELEC607"],
    104721021255: ["ELEC504", "ELEC410", "ELEC407"],
    100621011414: ["ELEC502", "ELEC504"],
    104722011529: ["ELEC402", "ELEC401", "ELEC407", "ELEC508", "ELEC505"],
    104619021334: ["ELEC619", "ELEC605", "ELEC614", "ELEC604", "ELEC616", "ELEC611", "ELEC602", "ELEC607"],
    104621011507: ["ELEC622", "ELEC619", "ELEC604", "ELEC607", "ELEC605", "ELEC608", "ELEC614", "ELEC616"],
    104621011394: ["ELEC604", "ELEC605", "ELEC607", "ELEC602", "ELEC622", "ELEC621", "ELEC608"],
    104621021202: ["ELEC607", "ELEC611", "ELEC621", "ELEC605", "ELEC616", "ELEC602", "ELEC604", "ELEC614"],
    104619011200: ["ELEC608", "ELEC621", "ELEC616", "ELEC602", "ELEC611", "ELEC619", "ELEC614", "ELEC605"],
    104621011353: ["ELEC605", "ELEC604"],
    100620011882: ["ELEC504", "ELEC514", "ELEC505"],
    100621021372: ["ELEC505", "ELEC514", "ELEC508", "ELEC602", "ELEC510"],
    100621011437: ["ELEC602", "ELEC514", "ELEC510", "ELEC505", "ELEC502"],
    100622021318: ["ELEC505", "ELEC504", "ELEC502", "ELEC508", "ELEC514"],
    100618021286: ["ELEC504"],
    104620011820: ["ELEC604", "ELEC605", "ELEC607", "ELEC608", "ELEC611", "ELEC616", "ELEC614", "ELEC619"],
    100618021265: ["ELEC507", "ELEC502", "ELEC505", "ELEC504"],
    100619021359: ["ELEC506", "ELEC507", "ELEC502", "ELEC505", "ELEC504"],
    100618021463: ["ELEC506", "ELEC507", "ELEC508", "ELEC510"],
    104721021228: ["ELEC407", "ELEC504", "ELEC502", "ELEC401", "ELEC410"],
    104622011460: ["ELEC616", "ELEC605", "ELEC622", "ELEC614", "ELEC611", "ELEC607", "ELEC602", "ELEC608"],
    104721011549: ["ELEC410", "ELEC401", "ELEC405", "ELEC505", "ELEC508"],
    104721011545: ["ELEC410", "ELEC401", "ELEC405", "ELEC505", "ELEC508"],
    104721011519: ["ELEC401", "ELEC405"],
    104621011508: ["ELEC605", "ELEC607", "ELEC616", "ELEC622", "ELEC602", "ELEC614", "ELEC611"],
    104721011523: ["ELEC401", "ELEC407"],
    104721011544: ["ELEC401"],
    104720011912: ["ELEC401", "ELEC405", "ELEC407", "ELEC508", "ELEC504"],
    104721011540: ["ELEC401", "ELEC410", "ELEC407"],
    104621021212: ["ELEC616", "ELEC622", "ELEC605", "ELEC619", "ELEC604", "ELEC621", "ELEC602", "ELEC608"],
    100618021264: ["ELEC507", "ELEC508", "ELEC502", "ELEC504"],
    104722011518: ["ELEC401", "ELEC407", "ELEC508"],
    104621021189: ["ELEC604", "ELEC611", "ELEC607", "ELEC621", "ELEC616", "ELEC622", "ELEC614", "ELEC602"],
    100619021387: ["ELEC508", "ELEC507", "ELEC510", "ELEC505", "ELEC504"],
    100616011397: ["ELEC507", "ELEC510"],
    104621011506: ["ELEC619", "ELEC608", "ELEC616", "ELEC614", "ELEC611", "ELEC622", "ELEC607", "ELEC604"],
    100618021260: ["ELEC506", "ELEC507", "ELEC510", "ELEC602", "ELEC508"],
    104721021253: ["ELEC407", "ELEC405", "ELEC401", "ELEC410"],
    104621021171: ["ELEC604", "ELEC614", "ELEC616", "ELEC622", "ELEC607", "ELEC616", "ELEC608", "ELEC605"],
    100621011416: ["ELEC502", "ELEC505", "ELEC514"],
    100621011408: ["ELEC502", "ELEC505"],
    104620011799: ["ELEC605", "ELEC604", "ELEC619", "ELEC616", "ELEC611", "ELEC614", "ELEC608", "ELEC602"],
    100619011045: ["ELEC510"],
    104619011204: ["ELEC616", "ELEC608", "ELEC604", "ELEC605", "ELEC614", "ELEC622", "ELEC607"],
    104622011459: ["ELEC621", "ELEC616", "ELEC619", "ELEC607", "ELEC604", "ELEC605", "ELEC622", "ELEC614"],
    104617021653: ["ELEC510", "ELEC602", "ELEC504", "ELEC514", "ELEC502"],
    104621011388: ["ELEC605", "ELEC604", "ELEC607", "ELEC611", "ELEC622", "ELEC602", "ELEC619", "ELEC616"],
    104621011345: ["ELEC605", "ELEC604", "ELEC607", "ELEC611", "ELEC622", "ELEC619", "ELEC616", "ELEC614"],
    104621021222: ["ELEC622", "ELEC621", "ELEC602", "ELEC604", "ELEC614", "ELEC607", "ELEC616", "ELEC611"],
    104716010968: ["ELEC502", "ELEC410", "ELEC401", "ELEC402", "ELEC508"],
    104621011375: ["ELEC602", "ELEC605", "ELEC607", "ELEC608", "ELEC616", "ELEC619", "ELEC614"],
    104722011552: ["ELEC407", "ELEC405", "ELEC410", "ELEC401", "ELEC508"],
    104618011483: ["ELEC619", "ELEC607", "ELEC622", "ELEC621", "ELEC604", "ELEC605", "ELEC614", "ELEC616"],
    100622011482: ["ELEC506", "ELEC505", "ELEC502", "ELEC504", "ELEC510"],
    100619021407: ["ELEC505", "ELEC504", "ELEC508"],
    104720011923: ["ELEC401", "ELEC410", "ELEC405", "ELEC407"],
    104621011370: ["ELEC604", "ELEC616", "ELEC619"],
    104618021305: ["ELEC604"],
    100621021377: ["ELEC507", "ELEC506", "ELEC504", "ELEC502", "ELEC505"],
    100618021266: ["ELEC502", "ELEC602", "ELEC508", "ELEC514", "ELEC507"],
    100622011495: ["ELEC508", "ELEC510", "ELEC507", "ELEC506"],
    100621021361: ["ELEC505", "ELEC502", "ELEC507", "ELEC510", "ELEC508"],
    104620011815: ["ELEC622", "ELEC604", "ELEC614", "ELEC602", "ELEC616", "ELEC619", "ELEC605", "ELEC611"],
    104721011514: ["ELEC405", "ELEC407", "ELEC602", "ELEC410", "ELEC508"],
    104721011517: ["ELEC405", "ELEC407", "ELEC410", "ELEC508", "ELEC505"],
    104619021335: ["ELEC619", "ELEC604", "ELEC607", "ELEC605", "ELEC614", "ELEC616", "ELEC608", "ELEC622"],
    100616010749: ["ELEC508", "ELEC507"],
    100618011555: ["ELEC505", "ELEC506", "ELEC510", "ELEC602", "ELEC508"],
    100617020845: ["ELEC514", "ELEC506", "ELEC602"],
    100618021265: ["ELEC507", "ELEC502", "ELEC504"],
    100621011511: ["ELEC507", "ELEC508", "ELEC510", "ELEC505", "ELEC504"],
    100621021349: ["ELEC510", "ELEC508", "ELEC502", "ELEC504", "ELEC602"],
    100620011831: ["ELEC508", "ELEC507", "ELEC506"],
    100621011413: ["ELEC504", "ELEC502", "ELEC514", "ELEC508"],
    100621011413: ["ELEC504", "ELEC502", "ELEC514"],
    100621021348: ["ELEC510", "ELEC508"],
    1006121021363: ["ELEC505", "ELEC502", "ELEC504", "ELEC508", "ELEC508"],
    100620011888: ["ELEC507", "ELEC508", "ELEC502", "ELEC506"],
    104618021304: ["ELEC621", "ELEC607", "ELEC604", "ELEC602", "ELEC616", "ELEC611", "ELEC619", "ELEC622"],
    100621011441: ["ELEC504", "ELEC502", "ELEC602", "ELEC507", "ELEC508"],
    104621011374: ["ELEC607", "ELEC619", "ELEC622", "ELEC604", "ELEC605", "ELEC608", "ELEC616", "ELEC602"],
    104722011541: ["ELEC407", "ELEC508", "ELEC405", "ELEC401", "ELEC410"],
    100621011402: ["ELEC508", "ELEC507", "ELEC602", "ELEC502", "ELEC506"],
    104621021200: ["ELEC607", "ELEC608", "ELEC611", "ELEC605", "ELEC622", "ELEC616", "ELEC604", "ELEC621"],
    100610011032: ["ELEC507", "ELEC502", "ELEC508", "ELEC506"],
    104617011703: ["ELEC605", "ELEC619", "ELEC604", "ELEC607", "ELEC622", "ELEC602", "ELEC614", "ELEC611"],
    104619011185: ["ELEC622", "ELEC607", "ELEC604", "ELEC605", "ELEC611", "ELEC614", "ELEC619", "ELEC621"],
    104720011915: ["ELEC407", "ELEC401", "ELEC402", "ELEC410", "ELEC405"],
    100618011110: ["ELEC507", "ELEC502", "ELEC504"],
    104618010034: ["ELEC605", "ELEC622", "ELEC611", "ELEC619", "ELEC604", "ELEC614", "ELEC616", "ELEC602"],
    104621011385: ["ELEC605", "ELEC604", "ELEC622", "ELEC611", "ELEC607", "ELEC619", "ELEC616"],
}
def preferencias_para(prog_code, est_cod):
    # Si el estudiante tiene preferencias personalizadas, las retorna
    if est_cod in PREFERENCIAS_ESTUDIANTES:
        return PREFERENCIAS_ESTUDIANTES[est_cod]
    # Si no, retorna las del programa
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
        prefs = preferencias_para(pc, est_cod)
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
    defaults={"ofefor_cantidad_electivas": 7}
)

OF, created2 = Oferta_formulario.objects.get_or_create(
    ofefor_anio=ANIO,
    ofefor_num_semestre=SEM,
    pro_codigo=PIET,
    defaults={"ofefor_cantidad_electivas": 5}
)

OF, created3 = Oferta_formulario.objects.get_or_create(
    ofefor_anio=ANIO,
    ofefor_num_semestre=SEM,
    pro_codigo=PIAI,
    defaults={"ofefor_cantidad_electivas": 5}
)
PYCODE
echo "==> OK (FORMULARIO)."
# Arranca el servidor
exec "$@"