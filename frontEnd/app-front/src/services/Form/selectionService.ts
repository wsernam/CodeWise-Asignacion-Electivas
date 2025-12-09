import apiClient from "../Auth/apiClient";
import { SELECTION_URL_PRIVATE, SELECTION_URL_PUBLIC, SELECTION_URL_DASHBOARD_PUBLIC, ESTADO_FORMULARIO_URL_PUBLIC } from "../config/config";
import type { ISelectionStudentElective, ISelectionDashboard, ISelectionElectivaDashboard,  ISelectionTotalesDashboard } from "../../models/Form/selection";

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

// ========== HELPERS ==========
export const transformSelectionTotalesDashboard = (data: any): ISelectionTotalesDashboard => ({

  total_inscritos: data.total_inscritos ?? 0, // usa 0 si no viene definido
  pro_codigo: data.pro_codigo || "",
});

export const transformSelectionTotalesDashboardList = (data: any[]): ISelectionTotalesDashboard[] =>
  data?.map(item => transformSelectionTotalesDashboard(item)) || [];


export const transformSelectionElectivaDashboard = (data: any): ISelectionElectivaDashboard => ({
  pro_codigo: data.pro_codigo || "",
  ele_codigo: data.ele_codigo || "",
  ele_nombre: data.ele_nombre || "",
  inscritos: data.inscritos ?? 0, // usa 0 si no viene definido
});

export const transformSelectionElectivaDashboardList = (data: any[]): ISelectionElectivaDashboard[] =>
  data?.map(item => transformSelectionElectivaDashboard(item)) || [];

export const transformSelectionDashboard = (data: any): ISelectionDashboard => ({
  total: data.total ?? 0,
  electivas: data.data?.map((item: any) => transformSelectionElectivaDashboard(item)) || [],
  totales: data.totales?.map((item: any) => transformSelectionTotalesDashboard(item)) || [],
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
      `${SELECTION_URL_PUBLIC}/${code}/${year}/${semester}`
    );
    const response = await apiClient.get(
      `${SELECTION_URL_PUBLIC}/${code}/${year}/${semester}`
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
    console.log("[selectionService] JSON Enviado:", JSON.stringify(s));
    console.error("[selectionService] Error creando selección:", error);
    console.error("[selectionService] Error response data:", error?.response?.data);
    
    // NO crear un nuevo Error, solo propagar el error original de Axios
    throw error;
  }
};

/**
 * Obtener la seleccion de todos los programas o de un programa para un periodo académico
 */
export const getSelectionDashboardService = async (
  programa_seleccionado: string,
  year: number,
  semester: number
): Promise<ISelectionDashboard> => {
  try {
    console.log("[selectionService] consultando selecciones para el dashboard:", programa_seleccionado, year, semester);
    const response = await apiClient.get(`${SELECTION_URL_DASHBOARD_PUBLIC}${programa_seleccionado}/${year}/${semester}`);
    const query = transformSelectionDashboard(response.data);
    console.log("[selectionService] selecciones consultadas:", query);
    return query;
  } catch (error: any) {
    console.error("[selectionService] Error consultando selecciones:", error);
    console.error("[selectionService] Error response data:", error?.response?.data);
    
    // NO crear un nuevo Error, solo propagar el error original de Axios
    throw error;
  }
};

export const getFormularioEstadoService = async (): Promise<boolean> => {
  try {
    console.log("[selectionService] Consultando estado del formulario...");

    // Usa apiClient, con el baseURL que ya tengas configurado.
    // Ajusta la ruta "/estado-formulario/" a la que tengas en tu backend.
    const response = await apiClient.get(`${ESTADO_FORMULARIO_URL_PUBLIC}estado-formulario/`);

    console.log(
      "[selectionService] Respuesta estado formulario:",
      response.data
    );

    // Suponiendo que el backend responde: { success: true, estado: true/false }
    return Boolean(response.data?.estado);
  } catch (error: any) {
    console.error(
      "[selectionService] Error consultando estado del formulario:",
      error
    );
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo verificar el estado del formulario"
    );
  }
};
