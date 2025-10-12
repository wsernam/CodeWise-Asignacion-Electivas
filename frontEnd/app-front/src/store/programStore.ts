import { create } from "zustand";
import type { IProgram as Program } from "../models/program";
import {
  getPrograms,
  createProgram,
  updateProgram,
  getProgramByCode,
  searchPrograms,
  getProgramStats,
  getFacultiesFromPrograms,
} from "../services/programService";

interface ProgramState {
  programs: Program[];
  faculties: Array<{ fac_codigo: number; fac_nombre: string }>;
  loading: boolean;
  error: string | null;
  fetchPrograms: () => Promise<void>;
  fetchFaculties: () => Promise<void>;
  addProgram: (program: Program) => Promise<void>;
  updateProgram: (pro_codigo: number, updated: Program) => Promise<void>;
  getProgramByCode: (pro_codigo: number) => Promise<Program | null>;
  searchPrograms: (searchTerm: string) => Promise<Program[]>;
  getProgramStats: () => Promise<{
    total: number;
    active: number;
    byFaculty: Record<string, number>;
  }>;
  clearError: () => void;
}

export const useProgramStore = create<ProgramState>((set) => ({
  programs: [],
  faculties: [],
  loading: false,
  error: null,

  /**
   * Limpia cualquier error en el estado
   */
  clearError: () => set({ error: null }),

  /**
   * Obtiene todos los programas desde el backend
   */
  fetchPrograms: async () => {
    console.log("[ProgramStore] Cargando programas...");
    set({ loading: true, error: null });
    try {
      const data = await getPrograms();
      console.log(`[ProgramStore] ${data.length} programas cargados`);
      set({ programs: [...data], loading: false });
    } catch (err: any) {
      console.error("[ProgramStore] Error cargando programas:", err);
      set({ programs: [], loading: false, error: "Error al cargar programas" });
    }
  },

  /**
   * Obtiene la lista de facultades desde los programas existentes
   * Esto es temporal hasta que tengamos un endpoint específico para facultades
   */
  fetchFaculties: async () => {
    console.log("[ProgramStore] Cargando facultades...");
    try {
      const faculties = await getFacultiesFromPrograms();
      console.log(`[ProgramStore] ${faculties.length} facultades cargadas`);
      set({ faculties });
    } catch (err: any) {
      console.error("[ProgramStore] Error cargando facultades:", err);
      set({ faculties: [] });
    }
  },

  /**
   * Agrega un nuevo programa al backend
   * @param program - Programa a crear
   */
  addProgram: async (program: Program) => {
    console.log("[ProgramStore] Agregando programa:", program);
    try {
      const newProgram = await createProgram(program);
      console.log("[ProgramStore] Programa agregado OK");
      set((state) => ({
        programs: [
          ...state.programs.filter(
            (p) => p.pro_codigo !== newProgram.pro_codigo
          ),
          newProgram,
        ],
        error: null,
      }));
    } catch (err: any) {
      console.log("[ProgramStore] Error agregando programa:", err.message);
      throw err;
    }
  },

  /**
   * Actualiza un programa existente en el backend
   * @param pro_codigo - Código del programa a actualizar
   * @param updated - Datos actualizados del programa
   */
  updateProgram: async (pro_codigo: number, updated: Program) => {
    console.log(`[ProgramStore] Actualizando programa ${pro_codigo}`);
    try {
      const updatedProgram = await updateProgram(updated);
      console.log("[ProgramStore] Programa actualizado OK");
      set((state) => ({
        programs: state.programs.map((p) =>
          p.pro_codigo === pro_codigo ? updatedProgram : p
        ),
        error: null,
      }));
    } catch (err: any) {
      console.log("[ProgramStore] Error actualizando programa:", err.message);
      throw err;
    }
  },

  /**
   * Obtiene un programa específico por su código
   * @param pro_codigo - Código del programa a buscar
   * @returns Programa encontrado o null si no existe
   */
  getProgramByCode: async (pro_codigo: number) => {
    console.log(`[ProgramStore] Buscando programa: ${pro_codigo}`);
    return await getProgramByCode(pro_codigo);
  },

  /**
   * Busca programas por término de búsqueda
   * @param searchTerm - Término de búsqueda
   * @returns Lista de programas que coinciden con la búsqueda
   */
  searchPrograms: async (searchTerm: string) => {
    console.log(`[ProgramStore] Buscando: "${searchTerm}"`);
    return await searchPrograms(searchTerm);
  },

  /**
   * Obtiene estadísticas de programas
   * @returns Objeto con total de programas, activos y distribución por facultad
   */
  getProgramStats: async () => {
    console.log("[ProgramStore] Obteniendo estadísticas");
    return await getProgramStats();
  },
}));
