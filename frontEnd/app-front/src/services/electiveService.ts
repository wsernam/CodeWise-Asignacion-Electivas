// src/services/electiveService.ts
import type { IElective } from "../models/elective";
import { ELECTIVES_URL } from "./config/config"; // ej: "/electivas"
import axiosInstance from "../api/axiosInstance"; // tu instancia configurada

// ========== HELPERS ==========
/** Ajusta aquí si tu backend devuelve otros nombres de campo */
const transformElective = (item: any): IElective => ({
  ele_codigo: item.ele_codigo,
  ele_nombre: item.ele_nombre,
  ele_estado: item.ele_estado, // boolean (activa/inactiva)
  pro_codigo: item.pro_codigo, // opcional según tu interfaz           // opcional según tu interfaz
  // ...agrega/ajusta más campos si IElective los define
});

// ========== FUNCIONES DE CONEXIÓN CON BACKEND ==========

/**
 * Obtiene todas las electivas
 */
export const getElectivesService = async (): Promise<IElective[]> => {
  try {
    console.log("[electiveService] Conectando a:", `${ELECTIVES_URL}/`);
    const { data } = await axiosInstance.get(`${ELECTIVES_URL}/?status=active`);
    console.log("[electiveService] Datos CRUDOS del backend:", data);

    const transformed: IElective[] = Array.isArray(data)
      ? data.map(transformElective)
      : [];
    console.log("[electiveService] Datos transformados:", transformed);
    return transformed;
  } catch (error: any) {
    console.error("[electiveService] Error obteniendo electivas:", error);
    throw new Error(error?.message || "No se pudieron cargar las electivas");
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
    const { data } = await axiosInstance.post(`${ELECTIVES_URL}/`, e);
    const created = transformElective(data);
    console.log("[electiveService] Electiva creada:", created);
    return created;
  } catch (error: any) {
    console.error("[electiveService] Error creando electiva:", error);
    throw new Error(error?.message || "No se pudo crear la electiva");
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
    const { data } = await axiosInstance.put(`${ELECTIVES_URL}/${codigo}/`, e);
    const updated = transformElective(data);
    console.log("[electiveService] Electiva actualizada:", updated);
    return updated;
  } catch (error: any) {
    console.error("[electiveService] Error actualizando electiva:", error);
    throw new Error(error?.message || "No se pudo actualizar la electiva");
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
    const { data } = await axiosInstance.delete(`${ELECTIVES_URL}/${codigo}/`);
    const deleted = transformElective(data);
    console.log("[electiveService] Electiva eliminada:", deleted);
    return deleted;
  } catch (error: any) {
    console.error("[electiveService] Error eliminando electiva:", error);
    throw new Error(error?.message || "No se pudo eliminar la electiva");
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
    const { data } = await axiosInstance.patch(
      `${ELECTIVES_URL}/${codigo}/reactivar/`
    );
    const reactivated = transformElective(data);
    console.log("✅ [electiveService] Electiva reactivada:", reactivated);
    return reactivated;
  } catch (error: any) {
    console.error("[electiveService] Error reactivando electiva:", error);
    throw new Error(error?.message || "No se pudo reactivar la electiva");
  }
};

/**
 * Obtiene una electiva por su código
 */
export const getElectiveByCodeService = async (
  codigo: string
): Promise<IElective | null> => {
  try {
    console.log(`🔎 [electiveService] Buscando electiva: ${codigo}`);
    const { data } = await axiosInstance.get(`${ELECTIVES_URL}/${codigo}/`);
    return transformElective(data);
  } catch (error: any) {
    // Si tu backend retorna 404, puedes capturarlo así:
    const status = error?.response?.status;
    if (status === 404) {
      console.warn("[electiveService] Electiva no encontrada:", codigo);
      return null;
    }
    console.error("[electiveService] Error buscando electiva:", error);
    throw new Error(error?.message || "No se pudo obtener la electiva");
  }
};
