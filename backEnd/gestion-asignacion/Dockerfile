# gestion-asignacion/Dockerfile
FROM python:3.10-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y build-essential libpq-dev \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Carpeta donde vivirá la BD SQLite (persistida via volumen)
RUN mkdir -p /app/data

COPY . .

# El compose sobreescribe este CMD
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
