import type { Program } from "../models/program";
import axiosInstance from "../api/axiosInstance";
// ===== DTO que espera/retorna el backend =====
type ProgramDTO = {
  pro_codigo: number;
  pro_nombre: string;
  fac_codigo: number;
  pro_estado: boolean;           // activo/inactivo en el backend
};

// ===== Front → Back =====
const toBackend = (p: Program): ProgramDTO => ({
  pro_codigo: Number(p.codigo),
  pro_nombre: p.nombre.trim(),
  fac_codigo: Number(p.facultad), 
  pro_estado: Boolean(p.active ?? true),
});

// ===== Back → Front =====
const fromBackend = (dto: ProgramDTO): Program => ({
  codigo: String(dto.pro_codigo),
  nombre: dto.pro_nombre,
  facultad: String(dto.fac_codigo),
  active: dto.pro_estado,
});

// ===== ENDPOINT base (con slash final) =====
// ====== ENDPOINTS (con slash final) ======

export const getPrograms = async (): Promise<Program[]> => {
  const res = await axiosInstance.get<ProgramDTO[]>("/programas/");
  return res.data.map(fromBackend);
};

export const createProgram = async (p: Program): Promise<Program> => {
  const payload = toBackend(p);
  const res = await axiosInstance.post<ProgramDTO>("/programas/", payload);
  return fromBackend(res.data);
};

export const updateProgram = async (codigo: string, p: Program): Promise<Program> => {
  const res = await axiosInstance.put<ProgramDTO>(`/programas/${codigo}/`, toBackend(p));
  return fromBackend(res.data);
};

export const getProgramByCode = async (codigo: string): Promise<Program> => {
  const res = await axiosInstance.get<ProgramDTO>(`/programas/${codigo}/`);
  return fromBackend(res.data);
};

export const reactivateProgram = async (codigo: string): Promise<Program> => {
  const res = await axiosInstance.patch<ProgramDTO>(`/programas/${codigo}/reactivar/`);
  return fromBackend(res.data);
};

// ====== Estadísticas ======
export const getProgramStats = async (): Promise<{
  total: number;
  active: number;
  byFaculty: Record<string, number>;
}> => {
  const res = await axiosInstance.get<{
    total: number;
    active: number;
    byFaculty: Record<string, number>;
  }>("/programas/estadisticas/");
  return res.data;
};

export const searchPrograms = async (searchTerm: string): Promise<Program[]> => {
  // Si tu backend usa DRF SearchFilter, podrías usar params: { search: searchTerm }
  const res = await axiosInstance.get<ProgramDTO[]>("/programas/search/", {
    params: { q: searchTerm },
  });
  return res.data.map(fromBackend);
};