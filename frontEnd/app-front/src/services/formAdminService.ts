import axios from "../api/axiosInstance";
import type { FormAdmin } from "../Models/formAdmin";
import { FORM_URL } from "./config/config";


export const offerElectives = async (): Promise<void> => {
  // Espera de implementación
}

export const changeFormStatus = async (form: FormAdmin): Promise<void> => {
  // Espera de implementación
}


/*
export const activateForm = async (codigo: number): Promise<void> => {
  const response = await axios.put(`${FORM_URL}/forms/activate/${codigo}`);
  return response.data;
};

export const deactivateForm = async (codigo: number): Promise<void> => {
  const response = await axios.put(`${FORM_URL}/forms/deactivate/${codigo}`);
  return response.data;
};
*/
