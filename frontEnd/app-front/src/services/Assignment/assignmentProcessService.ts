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
          pa_activo: true,
        }),
      });

      if (!response.ok)
        throw new Error(`Error creando proceso: ${response.statusText}`);
      return (await response.json()) as AssignmentProcess;
    } catch (error) {
      console.error("[assignmentProcessService] Error creando proceso:", error);
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
};
