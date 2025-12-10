import axiosInstance from "./axiosInstance";
import type { IElective } from "../models/Form/elective";

/**
 * Obtiene la lista de electivas.
 * @param status - 'all' para todas, 'active' para solo activas.
 * @returns Una promesa que resuelve a un array de electivas.
 */
export const getElectives = async (status: "all" | "active" = "all"): Promise<IElective[]> => {
  const response = await axiosInstance.get<IElective[]>(`/gestion-formulario/electivas?status=${status}`);
  return response.data;
};

/**
 * Crea una nueva electiva.
 * @param electiveData - Los datos de la electiva a crear.
 * @returns Una promesa que resuelve a la electiva creada.
 */
export const createElective = async (electiveData: Omit<IElective, 'ele_estado'> & { ele_estado?: boolean }): Promise<IElective> => {
  const response = await axiosInstance.post<IElective>("/gestion-formulario/admin/electivas", electiveData);
  return response.data;
};

/**
 * Actualiza una electiva existente.
 * @param ele_codigo - El código de la electiva a actualizar.
 * @param electiveData - Los nuevos datos para la electiva.
 * @returns Una promesa que resuelve a la electiva actualizada.
 */
export const updateElective = async (ele_codigo: string, electiveData: Partial<IElective>): Promise<IElective> => {
  const response = await axiosInstance.put<IElective>(`/gestion-formulario/admin/electivas/${ele_codigo}/`, electiveData);
  return response.data;
};

/**
 * Cambia el estado (activo/inactivo) de una electiva.
 * @param ele_codigo - El código de la electiva a modificar.
 * @returns Una promesa que resuelve a la electiva con su nuevo estado.
 */
export const toggleElectiveStatus = async (ele_codigo: string): Promise<IElective> => {
  const response = await axiosInstance.patch<IElective>(`/gestion-formulario/admin/electivas/${ele_codigo}/toggle_estado/`);
  return response.data;
};