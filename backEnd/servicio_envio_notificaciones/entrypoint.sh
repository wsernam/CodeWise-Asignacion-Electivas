#!/bin/bash
set -euo pipefail
sed -i 's/\r$//' "$0"

# Parámetros (puedes sobreescribir en docker-compose)
export RUN_SEED_ASYNC="${RUN_SEED_ASYNC:-1}"             # 1 = sí, 0 = no

echo "==> Migrando…"
python manage.py migrate --noinput
python manage.py makemigrations

# 🔹 Lanza el seed en segundo plano (NO bloquea el arranque)
if [ "$RUN_SEED_ASYNC" = "1" ]; then
  echo "==> Lanzando siembra de perfiles en background…"
  nohup /usr/local/bin/seed_perfiles.sh >/tmp/seed_perfiles.log 2>&1 &
else
  echo "==> RUN_SEED_ASYNC=0 → No se lanza seed de perfiles."
fi

echo "==> Arrancando servidor…"
exec "$@"   # ej. ["python","manage.py","runserver","0.0.0.0:8002"]
