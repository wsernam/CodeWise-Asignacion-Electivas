from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from tablib import Dataset
import openpyxl 
import io
import traceback 
import requests
from decimal import Decimal, InvalidOperation

# Importamos el nuevo Resource
from .resources import PerfilAcademicoResource 
from referencias.models import SeleccionEstudianteElectiva


class ValidarExcelAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        excel_files = request.FILES.getlist('files')
        if not excel_files:
            return Response({'error': 'No se encontraron archivos en la solicitud.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Obtener el periodo activo desde el otro microservicio
        try:
            periodo_response = requests.get('http://localhost:8002/api/asignacion/procesos/periodo-activo/')
            if periodo_response.status_code == 204:
                return Response({'error': 'No se encontró un proceso de asignación ACTIVO.'}, status=status.HTTP_404_NOT_FOUND)
            periodo_response.raise_for_status()
            periodo_data = periodo_response.json()
            #TODO: Verificar estructura de periodo_data
            anio_activo = periodo_data['pa_anio']
            semestre_activo = periodo_data['pa_num_semestre']
        except requests.RequestException as e:
            return Response({'error': f'No se pudo comunicar con el servicio de asignación: {e}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # 2. Obtener códigos de estudiante de la BD para el periodo activo
        codigos_db = set(SeleccionEstudianteElectiva.objects.filter(
            sel_anio=anio_activo,
            sel_num_semestre=semestre_activo
        ).values_list('est_codigo', flat=True).distinct())

        # 3. Extraer códigos de estudiante de los Excels
        codigos_excel = set()
        for excel_file in excel_files:
            try:
                dataset = Dataset().load(excel_file.read())
                # Asumimos que la columna de códigos se llama 'CODIGO'
                for row in dataset.dict:
                    codigo_str = str(row.get('CODIGO', '')).strip()
                    if codigo_str:
                        # Limpiar '.0' si viene como float
                        if codigo_str.endswith('.0'):
                            codigo_str = codigo_str[:-2]
                        codigos_excel.add(int(codigo_str))
            except (Exception, InvalidOperation, ValueError) as e:
                # Ignorar filas o archivos mal formateados, enfocándonos en la validación de códigos
                pass

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
            'periodo_evaluado': f'{anio_activo}-{semestre_activo}'
        }, status=status.HTTP_200_OK)

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
                for error in row[1]:
                    # Si el error es un diccionario (ValidationError), lo iteramos.
                    if hasattr(error.error, 'items'):
                        errores_de_fila.extend([f"Error en campo '{key}': {val[0]}" for key, val in error.error.items()])
                    # Si no (ej. una excepción), lo convertimos a string.
                    else:
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
