// src/services/Assignment/niveladosService.ts
import apiClient from "../Auth/apiClient";
import { NIVELADOS_URL_PRIVATE } from "../config/config";
import type {
  LeveledStudent,
  ConfirmLeveledRequest,
} from "../../models/Assignment/assignmentProcess";

export const niveladosService = {
  /**
   * CALCULAR Y GESTIONAR ESTUDIANTES NIVELADOS
   * Endpoint: PUT /api/nivelados/gestionar-nivelados/
   * @param anio - Año del proceso
   * @param semestre - Semestre del proceso
   * @returns Mensaje de confirmación
   */
  async gestionarNivelados(
    anio: number,
    semestre: number
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.put(
        `${NIVELADOS_URL_PRIVATE}/gestionar-nivelados/`,
        { anio, num_semestre: semestre }
      );

      return response.data as { message: string };
    } catch (error: any) {
      console.error("[niveladosService] Error gestionando nivelados:", error);
      throw new Error(
        error.response?.data?.detail ||
          `Error gestionando nivelados: ${error.message}`
      );
    }
  },

  /**
   * Endpoint: GET /api/nivelados/listar-nivelados/{anio}/{semestre}/
   * @param anio - Año del proceso
   * @param semestre - Semestre del proceso
   * @returns Lista de estudiantes nivelados con sus datos académicos
   */
  async listarNivelados(
    anio: number,
    semestre: number
  ): Promise<LeveledStudent[]> {
    try {
      const response = await apiClient.get(
        `${NIVELADOS_URL_PRIVATE}/listar-nivelados/${anio}/${semestre}/`
      );

      return response.data as LeveledStudent[];
    } catch (error: any) {
      console.error("[niveladosService] Error listando nivelados:", error);
      throw new Error(
        error.response?.data?.detail ||
          `Error listando nivelados: ${error.message}`
      );
    }
  },

  /**
   * Endpoint: PUT /api/nivelados/confirmar-nivelados/{anio}/{semestre}/
   * @param anio - Año del proceso
   * @param semestre - Semestre del proceso
   * @param estudiantes - Lista de estudiantes a confirmar
   * @returns Mensaje de confirmación
   */
  async confirmarNivelados(
    anio: number,
    semestre: number,
    estudiantes: ConfirmLeveledRequest[]
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.put(
        `${NIVELADOS_URL_PRIVATE}/confirmar-nivelados/${anio}/${semestre}/`,
        estudiantes
      );

      return response.data as { message: string };
    } catch (error: any) {
      console.error("[niveladosService] Error confirmando nivelados:", error);
      throw new Error(
        error.response?.data?.detail ||
          `Error confirmando nivelados: ${error.message}`
      );
    }
  },
};
