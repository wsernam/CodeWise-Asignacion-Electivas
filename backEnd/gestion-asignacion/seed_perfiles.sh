#!/bin/bash
set -e
sed -i 's/\r$//' "$0"

# Puedes sobreescribir con ANIO=2025 SEM=2 ./seed_perfiles.sh
export ANIO="${ANIO:-2025}"
export SEM="${SEM:-2}"

DELAY="${SEED_DELAY_SECONDS:-40}"
EXPECT_MIN_STUDENTS="${EXPECT_MIN_STUDENTS:-1}"
WAIT_MAX_SECONDS="${WAIT_MAX_SECONDS:-30}"

echo "==> Seed de perfiles: comenzando cuenta regresiva de ${DELAY}s…"
for ((i=DELAY; i>0; i--)); do
  echo "   • sembrando en ${i}s…"
  sleep 1
done

echo "Sembrando PerfilesAcadémicos (ASIGNACIÓN) para ${ANIO}-${SEM}…"

python manage.py shell <<'PYCODE'
import os
from decimal import Decimal
from django.db import transaction

ANIO = int(os.environ.get("ANIO", "2025"))
SEM  = int(os.environ.get("SEM",  "2"))

from referencias.models import Estudiante
from gestion_hojas_de_calculo.models import PerfilAcademico

SCEN = [
    # (est_codigo, nivelado, avance, promedio, periodos, cursadas, creditos_aprob_total)
    (200000000001, True,  Decimal("100.0"), Decimal("4.60"), 9, 2, 153),
    (200000000002, True,  Decimal("100.0"), Decimal("4.40"), 8, 2, 153),
    (200000000003, True,  Decimal("100.0"), Decimal("4.30"),10, 4, 160),
    (200000000004, False, Decimal("98.5"),  Decimal("4.20"), 9, 3, 150),
    (200000000005, False, Decimal("97.0"),  Decimal("4.10"), 8, 2, 145),

    (200000000006, True,  Decimal("100.0"), Decimal("4.50"), 9, 2, 153),
    (200000000007, False, Decimal("98.2"),  Decimal("4.35"), 8, 1, 148),
    (200000000008, False, Decimal("96.0"),  Decimal("4.00"), 8, 1, 140),
    (200000000009, True,  Decimal("100.0"), Decimal("4.55"),10, 4, 160),
    (200000000010, False, Decimal("99.0"),  Decimal("4.70"), 9, 4, 160),

    (200000000011, True,  Decimal("100.0"), Decimal("4.25"), 9, 2, 153),
    (200000000012, False, Decimal("98.1"),  Decimal("4.00"), 8, 2, 150),
    (200000000013, False, Decimal("95.0"),  Decimal("3.80"), 7, 1, 130),
    (200000000014, True,  Decimal("100.0"), Decimal("4.10"), 8, 2, 153),
    (200000000015, False, Decimal("92.0"),  Decimal("3.60"), 6, 1, 110),

    (200000000016, True,  Decimal("100.0"), Decimal("4.70"), 9, 3, 158),
    (200000000017, False, Decimal("98.0"),  Decimal("4.20"), 8, 2, 150),
    (200000000018, True,  Decimal("100.0"), Decimal("4.33"),10, 4, 160),
    (200000000019, False, Decimal("90.0"),  Decimal("3.50"), 7, 1, 120),
    (200000000020, False, Decimal("99.5"),  Decimal("4.80"), 9, 4, 160),
]

creados, actualizados, omitidos = 0, 0, 0
with transaction.atomic():
    for (cod, niv, av, prom, per, curs, cred) in SCEN:
        if not Estudiante.objects.filter(pk=cod).exists():
            omitidos += 1
            continue
        defaults = dict(
            nivelado=niv,
            porcentaje_avance=av,
            promedio=prom,
            num_periodos_matriculados=per,
            num_electivas_cursadas=curs,
            creditos_aprob_total=cred,
            estado=True
        )
        pa, created = PerfilAcademico.objects.get_or_create(
            est_codigo_id=cod,
            perfil_anio=ANIO,
            perfil_semestre=SEM,
            defaults=defaults
        )
        if created:
            creados += 1
        else:
            changed = False
            for k, v in defaults.items():
                if getattr(pa, k) != v:
                    setattr(pa, k, v); changed = True
            if changed:
                pa.save(); actualizados += 1

print(f"Perfiles creados: {creados}")
print(f"Perfiles actualizados: {actualizados}")
print(f"Perfiles omitidos (no existe estudiante): {omitidos}")
PYCODE

echo "==> OK (ASIGNACIÓN)."

# Arranca el servidor
exec "$@"