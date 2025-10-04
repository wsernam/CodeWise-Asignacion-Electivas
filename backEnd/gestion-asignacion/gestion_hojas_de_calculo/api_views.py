from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from tablib import Dataset
import openpyxl 
import io
import traceback 

# Importamos el nuevo Resource
from .resources import PerfilAcademicoResource 

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
                # row[0] es el índice (base 0), sumamos 2 para la fila de Excel
                error_details.append({
                    'fila': row[0] + 2, 
                    'errores': [f"Error de campo: {key} - {value}" for key, value in row[1].items()]
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
