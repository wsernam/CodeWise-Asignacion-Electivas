// src/services/Assignment/niveladosService.ts
import { NIVELADOS_URL } from "../config/config";
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
    const response = await fetch(`${NIVELADOS_URL}/gestionar-nivelados/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anio, num_semestre: semestre }),
    });

    if (!response.ok)
      throw new Error(`Error gestionando nivelados: ${response.statusText}`);
    return (await response.json()) as { message: string };
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
    const response = await fetch(
      `${NIVELADOS_URL}/listar-nivelados/${anio}/${semestre}/`
    );
    if (!response.ok)
      throw new Error(`Error listando nivelados: ${response.statusText}`);
    return (await response.json()) as LeveledStudent[];
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
    const response = await fetch(
      `${NIVELADOS_URL}/confirmar-nivelados/${anio}/${semestre}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estudiantes),
      }
    );

    if (!response.ok)
      throw new Error(`Error confirmando nivelados: ${response.statusText}`);
    return (await response.json()) as { message: string };
  },
};
