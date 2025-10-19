from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from tablib import Dataset
import openpyxl 
import io
import traceback 
import requests
import logging
from decimal import Decimal, InvalidOperation

# Importamos el nuevo Resource
from .resources import PerfilAcademicoResource 
from referencias.models import SeleccionEstudianteElectiva


logger = logging.getLogger(__name__)

class ValidarExcelAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        excel_files = request.FILES.getlist('files')
        if not excel_files:
            return Response({'error': 'No se encontraron archivos en la solicitud.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Obtener el periodo activo desde el otro microservicio
        try:
            # CORRECCIÓN: En un entorno Docker, los servicios se comunican usando el nombre del servicio
            # y el puerto INTERNO, no localhost y el puerto externo.
            periodo_response = requests.get('http://gestion-asignacion:8000/api/asignacion/procesos/periodo-activo/')
            if periodo_response.status_code == 204:
                return Response({'error': 'No se encontró un proceso de asignación ACTIVO.'}, status=status.HTTP_404_NOT_FOUND)
            periodo_response.raise_for_status()
            periodo_data = periodo_response.json()
            anio_activo = periodo_data['pa_anio']
            semestre_activo = periodo_data['pa_num_semestre']
        except requests.RequestException as e:
            return Response({'error': f'No se pudo comunicar con el servicio de asignación: {e}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # 2. Obtener códigos de estudiante de la BD para el periodo activo
        codigos_db = set(SeleccionEstudianteElectiva.objects.filter(
            sel_anio=anio_activo,
            sel_num_semestre=semestre_activo
        ).values_list('est_codigo', flat=True).distinct())

        # 3. Extraer códigos de estudiante de los Excels USANDO EL RESOURCE
        codigos_excel = set()
        resource = PerfilAcademicoResource() # Instanciamos el resource
        errores_procesamiento = []

        for excel_file in excel_files:
            try:
                filename = excel_file.name.lower()
                if filename.endswith('.xlsx'):
                    file_format = 'xlsx'
                elif filename.endswith('.xls'):
                    file_format = 'xls'
                else:
                    errores_procesamiento.append(f"Archivo '{excel_file.name}' ignorado: formato no soportado.")
                    continue

                # Cargamos los datos en un dataset
                dataset = Dataset()
                dataset.load(excel_file.read(), format=file_format)

                # CORRECCIÓN: Iteramos sobre `dataset.dict`. Esto devuelve cada fila como un
                # diccionario (ej: {'CODIGO': 123, ...}), que es lo que el método `clean` espera.
                # El método `iter_rows` no existe en el resource para este propósito.
                for i, row in enumerate(dataset.dict):
                    try:
                        # El widget del resource ya limpió y convirtió el código a un objeto Estudiante
                        estudiante_instance = resource.fields['est_codigo'].clean(row)
                        if estudiante_instance:
                            codigos_excel.add(estudiante_instance.est_codigo)
                    except ValueError as e:
                        # Capturamos errores de validación del widget (ej: estudiante no encontrado, celda con texto)
                        msg = f"Fila {i+2} del archivo '{excel_file.name}' ignorada: {e}"
                        logger.warning(msg)
                        errores_procesamiento.append(msg)
            except Exception as e:
                msg = f"Error crítico al procesar el archivo '{excel_file.name}': {e}. Asegúrate de tener instalada la librería 'xlrd' para archivos .xls."
                logger.error(msg, exc_info=True)
                errores_procesamiento.append(msg)

        # 4. Comparar y generar respuesta
        faltantes = list(codigos_db - codigos_excel)
        sobrantes = list(codigos_excel - codigos_db)
        coinciden = not faltantes and not sobrantes

        return Response({
            'faltantes': faltantes,
            'sobrantes': sobrantes,
            'num_faltantes': len(faltantes),
            'num_sobrantes': len(sobrantes),
            'coinciden': coinciden,
            'periodo_evaluado': f'{anio_activo}-{semestre_activo}',
            'advertencias': errores_procesamiento
        }, status=status.HTTP_200_OK)


class PrevisualizarIncompletosAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        excel_files = request.FILES.getlist('files')
        if not excel_files:
            return Response({'error': 'No se encontraron archivos en la solicitud.'}, status=status.HTTP_400_BAD_REQUEST)

        codigos_incompletos = set()
        errores_procesamiento = []

        # Columnas que deben estar vacías para que una fila se considere "incompleta"
        # (además de que 'CODIGO' debe estar lleno)
        columnas_a_verificar = [
            'CREDITOS_APROBADOS',
            'PROMEDIO_CARRERA',
            'APROBADAS',
            'PERIODOS_MATRICULADOS'
        ]

        for excel_file in excel_files:
            try:
                filename = excel_file.name.lower()
                if filename.endswith('.xlsx'):
                    file_format = 'xlsx'
                elif filename.endswith('.xls'):
                    file_format = 'xls'
                else:
                    errores_procesamiento.append(f"Archivo '{excel_file.name}' ignorado: formato no soportado.")
                    continue

                # CORRECCIÓN: Se elimina la carga duplicada.
                # Nos aseguramos de que el puntero del archivo esté al inicio antes de leerlo.
                # Esto previene errores si el stream ya fue leído por algún middleware.
                excel_file.seek(0)
                
                dataset = Dataset()
                dataset.load(excel_file.read(), format=file_format)

                # --- INICIO: DIAGNÓSTICO MEJORADO ---
                logger.info(f"Previsualizar - Archivo '{excel_file.name}' cargado. Contiene {len(dataset)} filas.")

                for i, row in enumerate(dataset.dict):
                    logger.info(f"Previsualizar - Fila {i+2} de '{excel_file.name}': {row}")
                    # --- FIN: DIAGNÓSTICO ---

                    codigo_valor = row.get('CODIGO')

                    # CORRECCIÓN: El valor del código viene como string. En lugar de usar `isinstance`,
                    # intentamos convertirlo a número. Si la conversión es exitosa, procedemos.
                    # Esto maneja tanto strings ('123') como números (123.0).
                    try:
                        float(codigo_valor) # Usamos float para validar, ya que acepta '123' y 123.0
                    except (ValueError, TypeError):
                        continue # Si no es un número válido, ignoramos la fila y continuamos.
                    else:
                        def is_cell_empty(value):
                            """
                            Función robusta para determinar si una celda está vacía.
                            Devuelve True para: None, '', '   '.
                            Devuelve False para: 'texto', 0, 123, '0'.
                            """
                            return value is None or not str(value).strip()

                        otras_columnas_vacias = all(is_cell_empty(row.get(col)) for col in columnas_a_verificar)

                        if otras_columnas_vacias:
                            # Limpiamos el código para asegurar que sea un entero
                            str_value = str(codigo_valor)
                            if str_value.endswith('.0'):
                                str_value = str_value[:-2]
                            codigos_incompletos.add(int(str_value))

            except Exception as e:
                msg = f"Error crítico al procesar el archivo '{excel_file.name}': {e}"
                logger.error(msg, exc_info=True)
                errores_procesamiento.append(msg)

        return Response({'codigos_incompletos': list(codigos_incompletos), 'advertencias': errores_procesamiento}, status=status.HTTP_200_OK)

class ImportarProductosAPIView(APIView):
    # DRF Parsers para manejar archivos y datos de formulario (FormData)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        """
        Recibe un archivo Excel (.xlsx o .xls), valida su contenido y lo importa/actualiza PerfilAcademico.
        """
        
        excel_file = request.FILES.get('file')

        if not excel_file:
            return Response({'error': 'No se encontró el archivo "file" en la solicitud.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # --- Lógica de detección de formato ---
        filename = excel_file.name.lower()
        
        if filename.endswith('.xlsx'):
            import_format = 'xlsx'
        elif filename.endswith('.xls'):
            import_format = 'xls' # Requiere 'xlrd' instalado
        else:
            return Response({'error': 'Formato de archivo no soportado. Por favor, sube un archivo .xlsx o .xls.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        # --------------------------------------

        dataset = Dataset()
        try:
            file_data = excel_file.read()
            # Carga el archivo usando el formato detectado
            dataset.load(file_data, format=import_format) 

        except Exception as e:
            return Response({'error': f'Error al procesar el archivo Excel ({import_format}): {e}'}, 
                            status=status.HTTP_400_BAD_REQUEST)


        # 3. Prueba de importación (Dry Run: Solo valida, no guarda en DB)
        resource = PerfilAcademicoResource() 
        
        try:
            result = resource.import_data(
                dataset, 
                dry_run=True,           
                raise_errors=False,     
                use_transactions=True   
            ) 
        except Exception as e:
            # Captura errores que ocurren en before_import_row, como Estudiante.DoesNotExist
            return Response({'error': f'Error de validación general: {e}', 'trace': traceback.format_exc()}, 
                            status=status.HTTP_400_BAD_REQUEST)


        if result.has_errors() or result.has_validation_errors():
            error_details = []
            
            for row in result.row_errors():
                fila_excel = row[0] + 2
                errores_de_fila = []
                # CORRECCIÓN: row[1] es una lista de objetos de error, debemos iterarla.
                for error in row[1]: # row[1] es una lista de errores para esa fila
                    # Si el error es un diccionario (ValidationError), lo iteramos.
                    if hasattr(error.error, 'items'):
                        # Caso 1: Error de validación de un campo específico.
                        # Extraemos el nombre del campo y el mensaje de error.
                        for field, messages in error.error.items():
                            errores_de_fila.append(f"Campo '{field}': {messages[0]}")
                    elif hasattr(error.error, 'message'):
                        # Caso 2: Error con un atributo 'message' (como ValueError).
                        errores_de_fila.append(error.error.message)
                    else:
                        # Caso 3: Otro tipo de excepción, lo convertimos a string.
                        errores_de_fila.append(str(error.error))
                error_details.append({
                    'fila': fila_excel, 
                    'errores': errores_de_fila
                })
            
            for error in result.base_errors:
                 error_details.append({'fila': 'General', 'errores': [str(error.error)]})

            return Response({
                'message': 'Importación fallida. Se encontraron errores de datos/mapeo.',
                'errores': error_details
            }, status=status.HTTP_400_BAD_REQUEST)

        # 4. Importación final (Guardar en la BD MySQL)
        try:
            result_final = resource.import_data(
                dataset, 
                dry_run=False,          
                raise_errors=True,      
                use_transactions=True
            ) 
        except Exception as e:
            return Response({'error': f'Error al guardar en la base de datos: {e}', 'trace': traceback.format_exc()}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 5. Respuesta exitosa
        return Response({
            'message': '¡Perfiles académicos importados y mapeados exitosamente!',
            'resumen': {
                'total_registros': len(dataset),
                'creados': result_final.totals.get('new', 0),
                'actualizados': result_final.totals.get('update', 0)
            }
        }, status=status.HTTP_200_OK)
