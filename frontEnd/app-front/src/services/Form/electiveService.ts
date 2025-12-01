// src/services/electiveService.ts
import apiClient from "../Auth/apiClient";
import type { IElective } from "../../models/Form/elective";
import { ELECTIVES_URL_PUBLIC, ELECTIVES_URL_PRIVATE } from "../config/config";

// ========== HELPERS ==========
const transformElective = (item: any): IElective => ({
  ele_codigo: item.ele_codigo,
  ele_nombre: item.ele_nombre,
  ele_estado: item.ele_estado,
  pro_codigo: item.pro_codigo,
});

// ========== FUNCIONES DE CONEXIÓN CON BACKEND ==========

/**
 * Obtiene todas las electivas
 */
export const getElectivesService = async (): Promise<IElective[]> => {
  try {
    console.log("[electiveService] Conectando a:", `${ELECTIVES_URL_PUBLIC}/`);
    const response = await apiClient.get(
      `${ELECTIVES_URL_PUBLIC}/?status=active`
    );
    console.log("[electiveService] Datos CRUDOS del backend:", response.data);

    const transformed: IElective[] = Array.isArray(response.data)
      ? response.data.map(transformElective)
      : [];
    console.log("[electiveService] Datos transformados:", transformed);
    return transformed;
  } catch (error: any) {
    console.error("[electiveService] Error obteniendo electivas:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudieron cargar las electivas"
    );
  }
};

/**
 * Crea una electiva
 */
export const createElectiveService = async (
  e: IElective
): Promise<IElective> => {
  try {
    console.log("[electiveService] Creando electiva:", e);
    const response = await apiClient.post(`${ELECTIVES_URL_PRIVATE}/`, e);
    const created = transformElective(response.data);
    console.log("[electiveService] Electiva creada:", created);
    return created;
  } catch (error: any) {
    console.error("[electiveService] Error creando electiva:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo crear la electiva"
    );
  }
};

/**
 * Actualiza una electiva por código
 */
export const updateElectiveService = async (
  codigo: string,
  e: IElective
): Promise<IElective> => {
  try {
    console.log("[electiveService] Actualizando electiva:", codigo, e);
    console.log("[electiveService] JSON que se enviará:", JSON.stringify(e));
    const response = await apiClient.put(
      `${ELECTIVES_URL_PRIVATE}/${codigo}/`,
      e
    );
    const updated = transformElective(response.data);
    console.log("[electiveService] Electiva actualizada:", updated);
    return updated;
  } catch (error: any) {
    console.error("[electiveService] Error actualizando electiva:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo actualizar la electiva"
    );
  }
};

/**
 * Elimina (o marca inactiva) una electiva por código
 */
export const deleteElectiveService = async (
  codigo: string
): Promise<IElective> => {
  try {
    console.log("[electiveService] Eliminando electiva:", codigo);
    const response = await apiClient.delete(
      `${ELECTIVES_URL_PRIVATE}/${codigo}/`
    );
    const deleted = transformElective(response.data);
    console.log("[electiveService] Electiva eliminada:", deleted);
    return deleted;
  } catch (error: any) {
    console.error("[electiveService] Error eliminando electiva:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar la electiva"
    );
  }
};

/**
 * Reactiva una electiva por código
 */
export const reactivateElectiveService = async (
  codigo: string
): Promise<IElective> => {
  try {
    console.log("[electiveService] Reactivando electiva:", codigo);
    const response = await apiClient.patch(
      `${ELECTIVES_URL_PRIVATE}/${codigo}/reactivar/`
    );
    const reactivated = transformElective(response.data);
    console.log("[electiveService] Electiva reactivada:", reactivated);
    return reactivated;
  } catch (error: any) {
    console.error("[electiveService] Error reactivando electiva:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo reactivar la electiva"
    );
  }
};

/**
 * Obtiene una electiva por su código
 */
export const getElectiveByCodeService = async (
  codigo: string
): Promise<IElective | null> => {
  try {
    console.log(`[electiveService] Buscando electiva: ${codigo}`);
    const response = await apiClient.get(`${ELECTIVES_URL_PUBLIC}/${codigo}/`);
    return transformElective(response.data);
  } catch (error: any) {
    // Si tu backend retorna 404, puedes capturarlo así:
    const status = error?.response?.status;
    if (status === 404) {
      console.warn("[electiveService] Electiva no encontrada:", codigo);
      return null;
    }
    console.error("[electiveService] Error buscando electiva:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo obtener la electiva"
    );
  }
};
