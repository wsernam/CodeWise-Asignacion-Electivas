import axios from '../api/axiosInstance';
import type { FormModel } from '../models/formModel';
import { FORM_URL } from './config/config';

export const getForms = async (): Promise<FormModel[]> => {
    const response = await axios.get(`${FORM_URL}/forms`);
    return response.data;
}

export const createForm = async (form: FormModel): Promise<FormModel> => {
    const response = await axios.post(`${FORM_URL}/forms/create`, form);
    return response.data;
}

export const activateForm = async (codigo: number): Promise<void> => {
    const response = await axios.put(`${FORM_URL}/forms/activate/${codigo}`);
    return response.data;
}

export const deactivateForm = async (codigo: number): Promise<void> => {
    const response = await axios.put(`${FORM_URL}/forms/deactivate/${codigo}`);
    return response.data;
}