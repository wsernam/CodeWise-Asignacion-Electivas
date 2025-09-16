Instrucciones microservicio de gestion formulario 

1. Configurar la base de datos en MySQL

El microservicio espera que la base de datos este configurada con los valores en el archivo .env,
bien sea de manera local o mediante contenedores. 

    1.1 Correr MySQL en un contenedor 
        -Primero se debe crear una network Docker para que los contenedores se puedan comunicar entre si
        docker network create red_formulario

        -obtener la imagen mysql
        docker pull mysql:8.0

        -crear y correr el contendor con mysql
        docker run --name db_formulario --network red_formulario -e MYSQL_ROOT_PASSWORD=admin -e MYSQL_DATABASE=db_formulario -e MYSQL_USER=admin -e MYSQL_PASSWORD=admin -p 3306:3306 -d mysql:8

2. Crear la imagen del microservicio

Dentro de este directorio ejecute el siguiente comando:

    docker build -t img_gestion_formulario . 

nota: el img_gestion_formulario es el nombre de la imagen y el . significa que el Dockerfile se encuentra en este directorio.

    para crear el contenedor ejecute el siguiente comando:
    docker run -d --name microservicio-gestion-formulario --network red_formulario -p 8000:8000 img_gestion_formulario

    nota: el argumento --network red_formulario es necesario unicamente si la base de datos esta corriendo dentro de un contenedor.
