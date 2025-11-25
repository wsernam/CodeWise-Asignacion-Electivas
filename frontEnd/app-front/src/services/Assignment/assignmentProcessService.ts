import { ASSIGNMENT_BASE_URL } from "../config/config";
import type { AssignmentProcess } from "../../models/Assignment/assignmentProcess";

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
      const response = await fetch(`${ASSIGNMENT_BASE_URL}/procesos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pa_anio: anio,
          pa_num_semestre: semestre,
//          pa_activo: true,
        }),
      });

      if (!response.ok) {
        // Obtener el error detallado del backend
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Si no se puede parsear JSON, usar el texto plano
          errorMessage = await response.text();
        }

        throw new Error(errorMessage);
      }

      return (await response.json()) as AssignmentProcess;
    } catch (error: any) {
      console.error("[assignmentProcessService] Error creando proceso:", error);

      // Mejorar mensajes de error genéricos
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose."
        );
      }

      if (error.message.includes("ERR_CONNECTION_REFUSED")) {
        throw new Error(
          "El servidor no está respondiendo. Verifica que el servicio de asignación esté activo en el puerto 8002."
        );
      }

      throw error;
    }
  },

  /**
   * OBTENER PROCESO DE ASIGNACIÓN ACTIVO ACTUAL
   * Endpoint: GET /api/asignacion/procesos/periodo-activo/
   * @returns Proceso activo o null si no hay ninguno
   */
  async obtenerProcesoActivo(): Promise<AssignmentProcess | null> {
    try {
      const response = await fetch(
        `${ASSIGNMENT_BASE_URL}/procesos/periodo-activo/`
      );
      if (response.status === 204) return null; // No hay proceso activo
      if (!response.ok)
        throw new Error(`Error obteniendo proceso: ${response.statusText}`);
      return (await response.json()) as AssignmentProcess;
    } catch (error) {
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
      const response = await fetch(`${ASSIGNMENT_BASE_URL}/procesos/`);
      if (!response.ok) {
        throw new Error(`Error obteniendo procesos: ${response.statusText}`);
      }
      return (await response.json()) as AssignmentProcess[];
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
      const response = await fetch(
        `${ASSIGNMENT_BASE_URL}/procesos/${codigo}/estado/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pa_estado: 2,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error finalizando proceso: ${response.statusText}`);
      }
      const proceso = await response.json();
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
   * EJECUTAR LA ASIGNACIÓN (motor cupos firmes + espera)
   * Endpoint: POST /api/asignacion/ejecutar/
   * @param anio - año del período (ej. 2025)
   * @param semestre - 1 | 2
   * @param opts - opciones: proCodigo (solo para stats), estrategia, debug
   * @returns resumen del proceso (creadas_firmes, creadas_en_espera, etc.)
   */
  // Ejecuta la asignación (cupo firme + lista de espera)
  async ejecutarAsignacion(
    anio: number,
    semestre: number,
    proCodigo?: string
  ): Promise<any> {
    const resp = await fetch(`${ASSIGNMENT_BASE_URL}/asignacion/ejecutar/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anio,
        semestre,
        ...(proCodigo ? { pro_codigo: proCodigo } : {}),
        debug: false,
      }),
    });

    if (!resp.ok) {
      let msg = `Error ejecutando asignación: ${resp.status} ${resp.statusText}`;
      try {
        const data = await resp.json();
        if (data.detail) msg = data.detail;
      } catch {}
      throw new Error(msg);
    }
    return resp.json();
  }

};
