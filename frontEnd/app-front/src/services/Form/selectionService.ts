import apiClient from "../Auth/apiClient";
import { SELECTION_URL_PRIVATE, SELECTION_URL_PUBLIC } from "../config/config";
import type { ISelectionStudentElective } from "../../models/Form/selection";

// ========== HELPERS ==========
const transformSelection = (data: any): ISelectionStudentElective => ({
  est_codigo: data.est_codigo,
  est_correo: data.est_correo || "",
  sel_anio: data.sel_anio,
  sel_num_semestre: data.sel_num_semestre,
  electivas:
    data.electivas?.map((item: any) => ({
      ele_codigo: item.ele_codigo,
      sel_prioridad: item.sel_prioridad,
      ele_nombre: item.ele_nombre || "",
    })) || [],
});

// ========== FUNCIONES DE CONEXIÓN CON BACKEND ==========
/**
 * Obtener selección de electivas por estudiante
 * @param code - Código del estudiante
 * @param year - Año académico
 * @param semester - Semestre (1 o 2)
 */
export const getSelectionsByStudent = async (
  code: number,
  year: number,
  semester: number
): Promise<ISelectionStudentElective> => {
  try {
    console.log(
      "[selectionService] Conectando a:",
      `${SELECTION_URL_PRIVATE}/${code}/${year}/${semester}`
    );
    const response = await apiClient.get(
      `${SELECTION_URL_PRIVATE}/${code}/${year}/${semester}`
    );
    console.log("[selectionService] Datos CRUDOS del backend:", response.data);
    const transformed = transformSelection(response.data);
    console.log("[selectionService] Datos transformados:", transformed);
    return transformed;
  } catch (error: any) {
    console.error("[selectionService] Error obteniendo selecciones:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudieron cargar las selecciones"
    );
  }
};

// ------------ VERIFICAR URL ------------
/**
 * Crear una selección de electiva para un estudiante
 */
export const createSelectionService = async (
  s: ISelectionStudentElective
): Promise<ISelectionStudentElective> => {
  try {
    console.log("[selectionService] Creando selección:", s);
    const response = await apiClient.post(`${SELECTION_URL_PUBLIC}`, s);
    const created = transformSelection(response.data);
    console.log("[selectionService] Selección creada:", created);
    return created;
  } catch (error: any) {
    console.log("JSON Enviado:", JSON.stringify(s));
    console.error("[selectionService] Error creando selección:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo crear la selección"
    );
  }
};
