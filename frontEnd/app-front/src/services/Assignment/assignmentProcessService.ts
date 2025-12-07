import apiClient from "../Auth/apiClient";
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

        throw new Error(
          `Error ${error.response.status}: ${error.response.statusText}`
        );
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
   * FINALIZAR UN PROCESO DE ASIGNACIÓN - ¡¡¡CORREGIDO!!!
   * Endpoint: PATCH /api/asignacion/procesos/{codigo}/estado/   ← ¡CAMBIADO!
   * @param codigo - Código del proceso a finalizar
   * @returns Proceso actualizado
   */
  async finalizarProceso(codigo: number): Promise<AssignmentProcess> {
    try {
      console.log("[assignmentProcessService] Finalizando proceso:", codigo);
      console.log("[DEBUG] Enviando estado=2 y pa_paso_actual=6 al backend");

      const response = await apiClient.patch(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/${codigo}/estado/`,
        {
          pa_estado: 2, // Estado finalizado
          pa_paso_actual: 6, // ← ¡AGREGAR ESTO! Paso final
        }
      );

      console.log(
        "[assignmentProcessService] Proceso finalizado, respuesta:",
        response.data
      );

      const proceso = response.data;

      // Verificar que el backend actualizó correctamente
      console.log("[DEBUG] Proceso recibido del backend:", {
        pa_estado: proceso.pa_estado,
        pa_paso_actual: proceso.pa_paso_actual,
        pa_anio: proceso.pa_anio,
        pa_num_semestre: proceso.pa_num_semestre,
      });

      if (proceso.pa_paso_actual !== 6) {
        console.warn(
          "[DEBUG] ¡ATENCIÓN! El backend no actualizó pa_paso_actual a 6"
        );
        console.warn("[DEBUG] Valor recibido:", proceso.pa_paso_actual);
      }

      return {
        ...proceso,
        fechaFinalizacion: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error(
        "[assignmentProcessService] Error finalizando proceso:",
        error
      );

      // Manejo de errores específico para este endpoint
      if (error.response) {
        const errorData = error.response.data;
        console.error("[DEBUG] Error response data:", errorData);

        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else if (errorData.pa_paso_actual) {
          // Error específico del campo pa_paso_actual
          throw new Error(
            `Error en paso actual: ${errorData.pa_paso_actual[0]}`
          );
        }
      }

      throw error;
    }
  },
  /**
   * ACTUALIZAR PASO ACTUAL DE UN PROCESO
   * Endpoint: PATCH /api/asignacion/procesos/{codigo}/paso/
   * @param codigo - Código del proceso
   * @param paso - Nuevo paso actual
   * @returns Proceso actualizado
   */
  async actualizarPasoProceso(
    codigo: number,
    paso: number
  ): Promise<AssignmentProcess> {
    try {
      console.log(
        `[assignmentProcessService] Actualizando proceso ${codigo} a paso ${paso}`
      );

      const response = await apiClient.patch(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/${codigo}/paso/`, // Verificar si existe este endpoint
        {
          pa_paso_actual: paso,
        }
      );

      console.log(
        "[assignmentProcessService] Paso actualizado:",
        response.data
      );
      return response.data as AssignmentProcess;
    } catch (error: any) {
      console.error(
        "[assignmentProcessService] Error actualizando paso:",
        error
      );

      if (error.response?.status === 404) {
        console.warn(
          "[DEBUG] Endpoint /paso/ no existe. El backend no soporta actualizar paso por separado."
        );
      }

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
      const response = await apiClient.delete(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/procesos/${codigo}/`
      );
      console.log(
        "[assignmentProcessService] Proceso eliminado:",
        response.data
      );
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
  async ejecutarAsignacion(anio: number, semestre: number): Promise<any> {
    try {
      const response = await apiClient.post(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/ejecutar/`,
        {
          anio,
          semestre,
        }
      );
      console.log(
        "[assignmentProcessService] Asignación ejecutada:",
        response.data
      );
      return response.data;
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
    const url = `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/reporte-asignacion/lotes-selecciones/`;
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
   * DESCARGAR PDF DE LOTES DE CÓDIGOS
   * Endpoint: GET api/reporte-asignacion/pdf/lotes-selecciones/?anio={anio}&semestre={semestre}
   * @param anio - Año académico
   * @param semestre - Semestre (1 o 2)
   * @returns PDF como Blob
   */
  async downloadCodeBatches(anio: number, semestre: number): Promise<Blob> {
    const url = `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/reporte-asignacion/pdf/lotes-selecciones/`;
    try {
      const resp = await apiClient.get(url, {
        params: { anio, semestre },
        responseType: "blob",
      });
      console.log("[codeBatchService] downloadCodeBatches response recibido");
      return resp.data as Blob;
    } catch (err: any) {
      console.error("[codeBatchService] downloadCodeBatches error:", err);
      throw err;
    }
  },

  /**
   * ELIMINAR ASIGNACIONES DE UN PERÍODO
   * Endpoint: DELETE /api/asignacion/purgar/
   */
  async purgarAsignaciones(anio: number, semestre: number): Promise<void> {
    try {
      await apiClient.delete(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/purgar/`,
        {
          params: {
            anio,
            semestre,
            dry_run: 0,
          },
        }
      );
      console.log(
        "[assignmentProcessService] Asignaciones purgadas para:",
        anio,
        semestre
      );
    } catch (error: any) {
      console.error(
        "[assignmentProcessService] Error purgando asignaciones:",
        error
      );
      throw error;
    }
  },

  /**
   * VERIFICAR ESTADO DEL FORMULARIO
   * Endpoint: GET /api/form/status/
   */
  async verificarEstadoFormulario(): Promise<{ formStatus: boolean }> {
    try {
      const response = await apiClient.get(
        `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/form/status/`
      );
      return response.data;
    } catch (error) {
      console.error(
        "[assignmentProcessService] Error verificando estado formulario:",
        error
      );
      throw error;
    }
  },

  /**
   * VERIFICAR OFERTAS ACTIVAS
   * Endpoint: GET /api/ofertas/verificar-activas/
   */
  async verificarOfertasActivas(
    anio: number,
    semestre: number
  ): Promise<boolean> {
    console.log(`[DEBUG] Verificando ofertas para ${anio}-${semestre}`);

    // TEMPORAL: Siempre retornar false hasta que el endpoint exista
    console.log(
      "[DEBUG] Endpoint no disponible, retornando false temporalmente"
    );
    return false;

    /*
  try {
    const response = await apiClient.get(
      `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/ofertas/verificar-activas/`,
      {
        params: { anio, semestre },
      }
    );
    return response.data.hay_ofertas_activas;
  } catch (error) {
    console.error(
      "[assignmentProcessService] Error verificando ofertas activas:",
      error
    );
    throw error;
  }
  */
  },

  /**
   * OBTENER ÚLTIMO PROCESO DE ASIGNACIÓN FINALIZADO
   * Cuando: pa_estado = 2 (inactivo) Y pa_paso_actual = 6
   * @returns Último proceso finalizado o null si no hay
   */
  async obtenerUltimoProcesoFinalizado(): Promise<AssignmentProcess | null> {
    try {
      console.log("[DEBUG] Obteniendo todos los procesos...");
      const todosProcesos = await this.obtenerTodosLosProcesos();

      console.log(
        "[DEBUG] Total de procesos encontrados:",
        todosProcesos.length
      );
      console.log("[DEBUG] Procesos:", todosProcesos);

      // Filtrar procesos finalizados
      const procesosFinalizados = todosProcesos.filter(
        (p) => p.pa_estado === 2
      );

      console.log(
        "[DEBUG] Procesos finalizados (estado=2, paso=6):",
        procesosFinalizados.length
      );
      console.log("[DEBUG] Procesos finalizados:", procesosFinalizados);

      if (procesosFinalizados.length === 0) {
        console.log("[DEBUG] No hay procesos finalizados encontrados");
        console.log("[DEBUG] Mostrando todos los procesos para debug:");
        todosProcesos.forEach((p, i) => {
          console.log(`[DEBUG] Proceso ${i}:`, {
            pa_codigo: p.pa_codigo,
            pa_anio: p.pa_anio,
            pa_num_semestre: p.pa_num_semestre,
            pa_estado: p.pa_estado,
            pa_paso_actual: p.pa_paso_actual,
            pa_fecha_creacion: p.pa_fecha_creacion,
          });
        });
        return null;
      }

      // Ordenar por fecha de creación descendente
      const ultimoProceso = procesosFinalizados.sort(
        (a, b) =>
          new Date(b.pa_fecha_creacion).getTime() -
          new Date(a.pa_fecha_creacion).getTime()
      )[0];

      console.log(
        "[DEBUG] Último proceso finalizado encontrado:",
        ultimoProceso
      );
      console.log("[DEBUG] Detalles del último proceso:", {
        pa_codigo: ultimoProceso.pa_codigo,
        pa_anio: ultimoProceso.pa_anio,
        pa_num_semestre: ultimoProceso.pa_num_semestre,
        pa_estado: ultimoProceso.pa_estado,
        pa_paso_actual: ultimoProceso.pa_paso_actual,
        periodo: `${ultimoProceso.pa_anio}-${ultimoProceso.pa_num_semestre}`,
      });

      return ultimoProceso;
    } catch (error) {
      console.error(
        "[assignmentProcessService] Error obteniendo último proceso finalizado:",
        error
      );
      throw error;
    }
  },
};

/**
 * CALCULAR PERIODO SIGUIENTE
 */
export function calcularPeriodoSiguiente(ultimoProceso: AssignmentProcess): {
  anio: number;
  semestre: 1 | 2;
} {
  if (ultimoProceso.pa_num_semestre === 1) {
    return { anio: ultimoProceso.pa_anio, semestre: 2 };
  } else {
    return { anio: ultimoProceso.pa_anio + 1, semestre: 1 };
  }
}

/**
 * OBTENER AÑOS DISPONIBLES PARA OFERTAS
 */
export function obtenerAniosDisponibles(
  hayProcesosFinalizados: boolean,
  ultimoProceso: AssignmentProcess | null
): number[] {
  const currentYear = new Date().getFullYear();

  if (!hayProcesosFinalizados || !ultimoProceso) {
    return [currentYear, currentYear + 1, currentYear + 2];
  } else {
    const periodoSiguiente = calcularPeriodoSiguiente(ultimoProceso);
    return [periodoSiguiente.anio];
  }
}
