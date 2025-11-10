import { EXCEL_PROCESSING_URL, ASSIGNMENT_BASE_URL } from "../config/config";
import type {
  ValidationResult,
  IncompleteRow,
} from "../../models/Assignment/assignmentProcess";

// Localmente se define la estructura para completar filas
interface FilaACompletar {
  archivo: string;
  fila: number;
  datos: Record<string, any>;
}

export const excelProcessingService = {
  /**
   * Endpoint: POST /api/excel/validar/
   * @param files - Archivos Excel subidos
   * @returns Resultado de validación con estudiantes faltantes/sobrantes
   */
  async validarExcel(files: File[]): Promise<ValidationResult> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const url = "http://localhost:8002/inventario/api/excel/validar/";

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    // AGREGAR manejo de errores del backend
    if (!response.ok) {
      // Intentar obtener el mensaje de error del backend
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }
      } catch {
        // Si no se puede parsear JSON, usar el texto plano
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as ValidationResult;
  },

  /**
   * Endpoint: POST /api/excel/previsualizar/
   * @param files - Archivos Excel a analizar
   * @returns Lista de filas con datos incompletos
   */
  async previsualizarIncompletos(
    files: File[]
  ): Promise<{ filas_incompletas: IncompleteRow[]; advertencias: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(`${EXCEL_PROCESSING_URL}/previsualizar/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok)
      throw new Error(`Error previsualizando: ${response.statusText}`);
    return await response.json();
  },

  /**
   * Endpoint: POST /api/excel/completar-y-procesar/
   * @param cacheKey - Clave de caché de archivos subidos
   * @param filasACompletar - Filas con datos completados por el usuario
   * @returns Resultado del procesamiento final
   */
  async completarYProcesar(
    cacheKey: string,
    filasACompletar: FilaACompletar[] = []
  ): Promise<any> {
    const response = await fetch(
      `${EXCEL_PROCESSING_URL}/completar-y-procesar/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cache_key: cacheKey,
          filas_a_completar: filasACompletar,
        }),
      }
    );

    if (!response.ok)
      throw new Error(`Error procesando: ${response.statusText}`);
    return await response.json();
  },

  /**
   * Endpoint: POST /api/asignacion/importar-perfiles/
   * @param files - Archivos Excel procesados
   * @returns Resultado de la importación
   */
  async importarPerfiles(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(`${ASSIGNMENT_BASE_URL}/importar-perfiles/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok)
      throw new Error(`Error importando: ${response.statusText}`);
    return await response.json();
  },
};
