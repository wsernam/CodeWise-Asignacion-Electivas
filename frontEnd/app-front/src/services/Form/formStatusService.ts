import apiClient from "../apiClient";
import { FORM_STATUS_URL_PUBLIC, FORM_STATUS_URL_PRIVATE } from "../config/config";

export const getFormStatus = async (): Promise<boolean> => {
  console.log("[formStatusService] Obteniendo estado del formulario...");
  try {
    const response = await apiClient.get(
      `${FORM_STATUS_URL_PUBLIC}estado-formulario/estado/estado-formulario/`
    );
    console.log("[formStatusService] Estado obtenido:", response.data);
    return response.data.estado;
  } catch (error: any) {
    console.error(
      "[formStatusService] Error obteniendo estado:",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.detail || 
      error?.message || 
      "No se pudo obtener el estado del formulario"
    );
  }
};

export const changeFormStatus = async (status: boolean): Promise<void> => {
  console.log("[formStatusService] Cambiando estado del formulario a:", status);
  try {
    const formStatus = { estado: status };
    const response = await apiClient.post(
      `${FORM_STATUS_URL_PRIVATE}toggle-formulario/estado/toggle-formulario/`,
      formStatus
    );
    console.log(
      "[formStatusService] Estado del formulario actualizado:",
      response.data
    );
  } catch (error: any) {
    console.error(
      "[formStatusService] Error cambiando estado:",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.detail || 
      error?.message || 
      "No se pudo cambiar el estado del formulario"
    );
  }
};