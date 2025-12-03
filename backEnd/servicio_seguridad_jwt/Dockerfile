# 1. Base Image: Usamos la versión slim para un tamaño más pequeño
FROM python:3.12-slim

# 2. Establecer el directorio de trabajo
WORKDIR /app

# 3. Instalar dependencias del sistema antes que las de Python
# Esto es una buena práctica para aprovechar el cache de Docker. Si cambias
# un archivo de Python, las dependencias del sistema no se reinstalan.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    dos2unix \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 4. Copiar e instalar dependencias de Python
# Copiamos solo el archivo de requerimientos para usar el cache de Docker.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar el script de inicialización
# Esto debe hacerse antes de copiar todo el proyecto para que el script
# esté listo para su uso.
COPY cargarUsuarios.sh /usr/local/bin/cargarUsuarios.sh
# Convertimos los finales de línea de Windows (CRLF) a Unix (LF) y damos permisos de ejecución
RUN dos2unix /usr/local/bin/cargarUsuarios.sh && \
    chmod +x /usr/local/bin/cargarUsuarios.sh

# 6. Copiar el código del proyecto
# Ahora copiamos el resto de tu aplicación.
COPY . .

# 7. Exponer el puerto
EXPOSE 8001

# 8. Corregir el punto de entrada (ENTRYPOINT)
# Aquí es donde se hace el cambio crucial. El ENTRYPOINT es el comando
# principal del contenedor. Usamos nuestro script de shell para manejar
# toda la lógica de inicialización.
ENTRYPOINT ["/usr/local/bin/cargarUsuarios.sh"]

# 9. Comando por defecto (CMD)
# El CMD especifica los argumentos por defecto que se le pasarán al ENTRYPOINT.
# En este caso, le decimos a nuestro script que ejecute el servidor de Django.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]