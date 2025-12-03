# 1. Base Image: Usamos la versión slim para un tamaño más pequeño
FROM python:3.12-slim

# 2. Establecer el directorio de trabajo
WORKDIR /app
#Evita que Python genere archivos .pyc (bytecode compilado) al ejecutar los scripts.
#Evita que se creen archivos innecesarios que no aportan valor en entornos de desarrollo o despliegue.
ENV PYTHONDONTWRITEBYTECODE=1
#Fuerza a Python a imprimir directamente en la salida estándar sin almacenar en búfer.
#Esto es útil para ver los logs en tiempo real, especialmente en entornos de contenedores.
ENV PYTHONUNBUFFERED=1

# 3. Instalar dependencias del sistema antes que las de Python
# Esto es una buena práctica para aprovechar el cache de Docker. Si cambias
# un archivo de Python, las dependencias del sistema no se reinstalan.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*
# 4. Copiar e instalar dependencias de Python
COPY requirements.txt .
#Compatibilidad con paquetes modernos, Imagen más liviana, Menor riesgo de errores por versiones viejas de pip.
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# 5. No hay script de inicialización
COPY seed_perfiles.sh /usr/local/bin/seed_perfiles.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh /usr/local/bin/seed_perfiles.sh
RUN chmod +x /usr/local/bin/seed_perfiles.sh

# Corregir finales de línea para compatibilidad con Unix (importante en Windows)
RUN sed -i 's/\r$//' /usr/local/bin/seed_perfiles.sh

# 6. Copiar el código del proyecto
# Ahora copiamos el resto de tu aplicación.

COPY . .

# 7. Exponer el puerto
EXPOSE 8000

# 8. Corregir el punto de entrada (ENTRYPOINT)
# Aquí es donde se hace el cambio crucial. El ENTRYPOINT es el comando
# principal del contenedor. Usamos nuestro script de shell para manejar
# toda la lógica de inicialización.
ENTRYPOINT ["sh","/usr/local/bin/entrypoint.sh"]


# El compose sobreescribe este CMD
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
