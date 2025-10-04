import axiosInstance from "../api/axiosInstance";
import type { IElective } from "../models/elective";

// Lo que espera el backend
type ElectiveDTO = {
  ele_codigo: number;
  ele_nombre: string;
  pro_codigo: number;
  ele_estado: boolean;
};

// Front → Back
const toBackend = (e: IElective): ElectiveDTO => ({
  ele_codigo: Number(e.codigo),                 // asegúrate de número
  ele_nombre: e.nombre.trim(),
  pro_codigo: Number(e.programa),               // OJO: que "programa" sea el código numérico
  ele_estado: Boolean(e.active ?? true),
});

// Back → Front (por si lees/actualizas)
const fromBackend = (dto: ElectiveDTO): IElective => ({
  codigo: String(dto.ele_codigo),
  nombre: dto.ele_nombre,
  programa: String(dto.pro_codigo),             // si en el front lo manejas como string
  active: dto.ele_estado,
});

// ====== ENDPOINTS (con slash final) ======

export const getElectivesService = async (): Promise<IElective[]> => {
  const res = await axiosInstance.get<ElectiveDTO[]>("/electivas/");
  return res.data.map(fromBackend);
};

export const createElectiveService = async (e: IElective): Promise<IElective> => {
  const payload = toBackend(e);
  const res = await axiosInstance.post<ElectiveDTO>("/electivas/", payload);
  return fromBackend(res.data);
};

export const updateElectiveService = async (codigo: string, e: IElective): Promise<IElective> => {
  const res = await axiosInstance.put<ElectiveDTO>(`/electivas/${codigo}/`, toBackend(e));
  return fromBackend(res.data);
};

export const deleteElectiveService = async (codigo: string): Promise<IElective> => {
  const res = await axiosInstance.delete<ElectiveDTO>(`/electivas/${codigo}/`);
  return fromBackend(res.data);
};

export const reactivateElectiveService = async (codigo: string): Promise<IElective> => {
  const res = await axiosInstance.patch<ElectiveDTO>(`/electivas/${codigo}/reactivar/`);
  return fromBackend(res.data);
};
