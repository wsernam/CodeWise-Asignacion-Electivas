import axios from "../api/axiosInstance";
import type { FormAdmin } from "../models/formAdmin";
import { FORM_URL } from "./config/config";

export const offerElectives = async (formData: FormAdmin): Promise<void> => {
  console.log("Guardando configuración:", formData);
  // Espera de implementación
  // await axios.post(`${FORM_URL}/offer`, formData);
};

export const changeFormStatus = async (formData: FormAdmin): Promise<void> => {
  console.log("Cambiando estado del formulario:", formData);
  // Espera de implementación
  // await axios.put(`${FORM_URL}/status`, formData);
};

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
