import axios from "../../api/axiosInstance";
import { FORM_STATUS_URL } from "../config/config";

export const getFormStatus = async (): Promise<boolean> => {
  console.log("[formStatusService] Obteniendo estado del formulario...");
  try {
    const response = await axios.get(
      `${FORM_STATUS_URL}/get_estado-formulario/`
    );
    console.log("[formStatusService] Estado obtenido:", response.data);
    return response.data.estado;
  } catch (error: any) {
    console.error(
      "[formStatusService] Error obteniendo estado:",
      error.response?.data
    );
    throw error;
  }
};

export const changeFormStatus = async (status: boolean): Promise<void> => {
  console.log("[formStatusService] Cambiando estado del formulario a:", status);
  try {
    const formStatus = { estado: status };
    const response = await axios.post(
      `${FORM_STATUS_URL}/toggle-formulario/`,
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
    throw error;
  }
};
