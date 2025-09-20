import axios from '../api/axiosInstance';
import type { Program } from '../models/program';
import { PROGRAMS_URL } from './config/config';

export const getPrograms = async (): Promise<Program[]> => {
    const response = await axios.get(`${PROGRAMS_URL}/programs`);
    return response.data;
}

export const createProgram = async (program: Program): Promise<Program> => {
    const response = await axios.post(`${PROGRAMS_URL}/create`, program);
    return response.data;
}

export const deactivateProgram = async (codigo: string): Promise<void> => {
    await axios.delete(`${PROGRAMS_URL}/deactivate/${codigo}`);
}

export const updateProgram = async (program: Program): Promise<Program> => {
    const response = await axios.put(`${PROGRAMS_URL}/update/${program.codigo}`, program);
    return response.data;
}