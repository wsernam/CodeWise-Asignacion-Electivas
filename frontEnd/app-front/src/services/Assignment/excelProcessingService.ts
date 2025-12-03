import apiClient from "../Auth/apiClient";
import {
  EXCEL_PROCESSING_URL_PRIVATE,
  ASSIGNMENT_API_BASE_URL_PRIVATE,
} from "../config/config";
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
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const url = `${EXCEL_PROCESSING_URL_PRIVATE}/validar/`;

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data as ValidationResult;
    } catch (error: any) {
      console.error("[excelProcessingService] Error validando Excel:", error);

      // Manejo de errores de Axios
      if (error.response) {
        const errorData = error.response.data;

        if (errorData.error) {
          throw new Error(errorData.error);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        }

        throw new Error(
          `Error ${error.response.status}: ${error.response.statusText}`
        );
      }

      throw error;
    }
  },

  /**
   * Endpoint: POST /api/excel/previsualizar/
   * @param files - Archivos Excel a analizar
   * @returns Lista de filas con datos incompletos
   */
  async previsualizarIncompletos(
    files: File[]
  ): Promise<{ filas_incompletas: IncompleteRow[]; advertencias: string[] }> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await apiClient.post(
        `${EXCEL_PROCESSING_URL_PRIVATE}/previsualizar/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("[excelProcessingService] Error previsualizando:", error);
      throw new Error(
        error.response?.data?.detail ||
          `Error previsualizando: ${error.message}`
      );
    }
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
    try {
      const response = await apiClient.post(
        `${EXCEL_PROCESSING_URL_PRIVATE}/completar-y-procesar/`,
        {
          cache_key: cacheKey,
          filas_a_completar: filasACompletar,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("[excelProcessingService] Error procesando:", error);
      throw new Error(
        error.response?.data?.detail || `Error procesando: ${error.message}`
      );
    }
  },

  /**
   * Endpoint: POST /api/asignacion/importar-perfiles/
   * @param files - Archivos Excel procesados
   * @returns Resultado de la importación
   */
  async importarPerfiles(files: File[]): Promise<any> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await apiClient.post(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}/importar-perfiles/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("[excelProcessingService] Error importando:", error);
      throw new Error(
        error.response?.data?.detail || `Error importando: ${error.message}`
      );
    }
  },
};
