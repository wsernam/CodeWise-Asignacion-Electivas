import apiClient from "../apiClient";
import { ASSIGNMENT_API_BASE_URL_PRIVATE } from "../config/config";
import type { AssignmentProcess } from "../../models/Assignment/assignmentProcess";
import type { CodeBatchesResponse } from "../../models/Assignment/assignmentProcess";

export const assignmentProcessService = {
  /**
   * CREAR NUEVO PROCESO DE ASIGNACIÓN
   * Endpoint: POST /api/asignacion/procesos/
   * @param anio
   * @param semestre
   * @returns Proceso creado con código único
   */
  async crearProceso(
    anio: number,
    semestre: number
  ): Promise<AssignmentProcess> {
    try {
      const response = await apiClient.post(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/`,
        {
          pa_anio: anio,
          pa_num_semestre: semestre,
        }
      );

      return response.data as AssignmentProcess;
    } catch (error: any) {
      console.error("[assignmentProcessService] Error creando proceso:", error);

      // Manejo de errores de Axios
      if (error.response) {
        // El servidor respondió con un código de error
        const errorData = error.response.data;
        
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        }
        
        throw new Error(`Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        throw new Error(
          "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose."
        );
      } else {
        // Error al configurar la petición
        throw new Error(error.message);
      }
    }
  },

  /**
   * OBTENER PROCESO DE ASIGNACIÓN ACTIVO ACTUAL
   * Endpoint: GET /api/asignacion/procesos/periodo-activo/
   * @returns Proceso activo o null si no hay ninguno
   */
  async obtenerProcesoActivo(): Promise<AssignmentProcess | null> {
    try {
      const response = await apiClient.get(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/periodo-activo/`
      );
      return response.data as AssignmentProcess;
    } catch (error: any) {
      // Si es un 204 (No Content), retornar null
      if (error.response?.status === 204) {
        return null;
      }
      
      console.error(
        "[assignmentProcessService] Error obteniendo proceso activo:",
        error
      );
      throw error;
    }
  },

  /**
   * OBTENER TODOS LOS PROCESOS DE ASIGNACIÓN
   * Endpoint: GET /api/asignacion/procesos/
   * @returns Lista de todos los procesos
   */
  async obtenerTodosLosProcesos(): Promise<AssignmentProcess[]> {
    try {
      const response = await apiClient.get(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/`
      );
      return response.data as AssignmentProcess[];
    } catch (error) {
      console.error(
        "[assignmentProcessService] Error obteniendo procesos:",
        error
      );
      throw error;
    }
  },

  /**
   * FINALIZAR UN PROCESO DE ASIGNACIÓN
   * Endpoint: PATCH /api/asignacion/procesos/{codigo}/
   * @param codigo - Código del proceso a finalizar
   * @returns Proceso actualizado
   */
  async finalizarProceso(codigo: number): Promise<AssignmentProcess> {
    try {
      const fechaFin = new Date().toISOString();
      const response = await apiClient.patch(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/${codigo}/estado/`,
        {
          pa_estado: 2,
        }
      );

      const proceso = response.data;
      return {
        ...proceso,
        fechaFinalizacion: fechaFin,
      };
    } catch (error: any) {
      console.error(
        "[assignmentProcessService] Error finalizando proceso:",
        error
      );
      throw error;
    }
  },

  /**
   * ELIMINAR UN PROCESO DE ASIGNACIÓN
   * Endpoint: DELETE /api/asignacion/procesos/{codigo}/
   * @param codigo - Código del proceso a finalizar
   * @returns Proceso eliminado
   */
  async eliminarProceso(codigo: number): Promise<AssignmentProcess> {
    try {
      const response = await apiClient.delete(`${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/${codigo}/`);
      console.log("[assignmentProcessService] Proceso eliminado:", response.data);
      return response.data as AssignmentProcess;
    } catch (error: any) {
      console.error(
        "[assignmentProcessService] Error eliminando proceso:",
        error
      );
      throw error;
    }
  },

  /**
   * EJECUTAR ASIGNACIÓN
   * Endpoint: POST /api/asignacion/ejecutar/
   * 
   * @param anio 
   * @param semestre 
   */

  async ejecutarAsignacion(anio: number, semestre: number ): Promise<any> {
    try {
      const response = await apiClient.post(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/ejecutar/`,
        {
          anio,
          semestre,
        }
      );
      console.log("[assignmentProcessService] Asignación ejecutada:", response.data);
    } catch (error: any) {
      console.error(
        "[assignmentProcessService] Error ejecutando asignación:",
        error
      );
      throw error;
    }
  },

  // Lotes de códigos de estudiantes para asignación

  /**
   * OBTENER LOTES DE CÓDIGOS DE ESTUDIANTES PARA ASIGNACIÓN
   * Endpoint: GET api/reporte-asignacion/lotes-selecciones/?anio={anio}&semestre={semestre}
   * @param anio - Año académico
   * @param semestre - Semestre (1 o 2)
   * @returns Información de lotes de códigos de estudiantes
   */
  async getCodeBatches(
    anio: number,
    semestre: number
  ): Promise<CodeBatchesResponse> {
    const url = `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/reporte-asignacion/lotes-selecciones/?anio={anio}&semestre={semestre}`;
    try {
      const resp = await apiClient.get<CodeBatchesResponse>(url, {
        params: { anio, semestre },
      });
      console.log("[codeBatchService] getCodeBatches response:", resp.data);
      return resp.data;
    } catch (err: any) {
      console.error("[codeBatchService] getCodeBatches error:", err);
      throw err;
    }
  },

  /**
   * OBTENER LOTES DE CÓDIGOS DE ESTUDIANTES PARA ASIGNACIÓN
   * Endpoint: GET api/reporte-asignacion/lotes-selecciones/?anio={anio}&semestre={semestre}
   * @param anio - Año académico
   * @param semestre - Semestre (1 o 2)
   * @returns Información de lotes de códigos de estudiantes
   */
  async downloadCodeBatches(
    anio: number,
    semestre: number
  ): Promise<Blob> {
    const url = `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/reporte-asignacion/pdf/lotes-selecciones/?anio={anio}&semestre={semestre}`;
    try {
      const resp = await apiClient.get(url, {
        params: { anio, semestre },
        responseType: 'blob',
      });
      console.log("[codeBatchService] getCodeBatches response:", resp.data);
      return resp.data as Blob;
    } catch (err: any) {
      console.error("[codeBatchService] getCodeBatches error:", err);
      throw err;
    }
  },
};
