import { create } from "zustand";
import type { IProgram as Program } from "../models/program";
import {
  getPrograms,
  createProgram,
  updateProgram,
  getProgramByCode,
  searchPrograms,
  getProgramStats,
} from "../services/programService";

interface ProgramState {
  programs: Program[];
  loading: boolean;
  error: string | null;
  fetchPrograms: () => Promise<void>;
  addProgram: (program: Program) => Promise<void>;
  updateProgram: (codigo: string, updated: Program) => Promise<void>;
  getProgramByCode: (codigo: string) => Promise<Program | null>;
  searchPrograms: (searchTerm: string) => Promise<Program[]>;
  getProgramStats: () => Promise<{
    total: number;
    active: number;
    byFaculty: Record<string, number>;
  }>;
  clearError: () => void;
}

export const useProgramStore = create<ProgramState>((set, get) => ({
  programs: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

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

  addProgram: async (program: Program) => {
    console.log("[ProgramStore] Agregando programa:", program);
    try {
      const newProgram = await createProgram(program);
      console.log("[ProgramStore] Programa agregado OK");
      set((state) => ({
        programs: [
          ...state.programs.filter((p) => p.codigo !== newProgram.codigo),
          newProgram,
        ],
        error: null,
      }));
    } catch (err: any) {
      console.log("[ProgramStore] Error agregando programa:", err.message);
      throw err;
    }
  },

  updateProgram: async (codigo: string, updated: Program) => {
    console.log(`[ProgramStore] Actualizando programa ${codigo}`);
    try {
      const updatedProgram = await updateProgram(updated);
      console.log("[ProgramStore] Programa actualizado OK");
      set((state) => ({
        programs: state.programs.map((p) =>
          p.codigo === codigo ? updatedProgram : p
        ),
        error: null,
      }));
    } catch (err: any) {
      console.log("[ProgramStore] Error actualizando programa:", err.message);
      throw err;
    }
  },

  getProgramByCode: async (codigo: string) => {
    console.log(`[ProgramStore] Buscando programa: ${codigo}`);
    return await getProgramByCode(codigo);
  },

  searchPrograms: async (searchTerm: string) => {
    console.log(`[ProgramStore] Buscando: "${searchTerm}"`);
    return await searchPrograms(searchTerm);
  },

  getProgramStats: async () => {
    console.log("[ProgramStore] Obteniendo estadísticas");
    return await getProgramStats();
  },
}));
