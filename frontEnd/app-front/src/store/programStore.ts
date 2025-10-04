// programStore.ts - Store completo siguiendo el modelo de electivas
import { create } from "zustand";
import type { Program } from "../Models/program";

import {
  getPrograms,
  createProgram,
  updateProgram,
  getProgramByCode,
  searchPrograms,
  getProgramStats,
} from "../services/programService";

/**
 * Interfaz que define el estado y las funciones del store de programas
 */
interface ProgramState {
  programs: Program[]; // Lista de programas en el estado
  loading: boolean; // Estado de carga
  error: string | null; // Mensaje de error si existe

  // Funciones principales
  fetchPrograms: () => Promise<void>; // Cargar todos los programas
  addProgram: (program: Program) => Promise<void>; // Agregar nuevo programa
  updateProgram: (codigo: string, updated: Program) => Promise<void>; // Actualizar programa
  getProgramByCode: (codigo: string) => Promise<Program | null>; // Obtener programa específico
  searchPrograms: (searchTerm: string) => Promise<Program[]>; // Buscar programas
  getProgramStats: () => Promise<{
    total: number;
    active: number;
    byFaculty: Record<string, number>;
  }>; // Estadísticas

  // Funciones de utilidad
  clearError: () => void; // Limpiar errores
  setLoading: (loading: boolean) => void; // Establecer estado de carga
}

/**
 * useProgramStore: store global para manejar programas
 * Sigue el mismo patrón que electiveStore pero adaptado para programas
 */
export const useProgramStore = create<ProgramState>((set, get) => ({
  programs: [], // Estado inicial vacío
  loading: false,
  error: null,

  /**
   * clearError: limpia el estado de error
   */
  clearError: () => set({ error: null }),

  /**
   * setLoading: establece el estado de carga
   */
  setLoading: (loading: boolean) => set({ loading }),

  /**
   * fetchPrograms: obtiene todos los programas y actualiza el store
   */
  fetchPrograms: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getPrograms();
      console.log("[Store] FetchPrograms:", data);
      set({ programs: [...data], loading: false });
    } catch (err: any) {
      console.error("[Store] Error fetching programs:", err);
      set({
        programs: [], // En caso de error completo, lista vacía
        loading: false,
        error: "Error al cargar los programas",
      });
    }
  },

  /**
   * addProgram: agrega un nuevo programa
   * Maneja errores si el programa ya existe activo o inactivo
   */
  addProgram: async (program: Program) => {
    try {
      const newProgram = await createProgram(program);
      console.log("[Store] Programa agregado:", newProgram);

      // Actualizamos el estado: reemplazar si existe o agregar si es nuevo
      set((state) => ({
        programs: [
          ...state.programs.filter((p) => p.codigo !== newProgram.codigo),
          newProgram,
        ],
        error: null,
      }));
    } catch (err: any) {
      console.error("[Store] Error al agregar programa:", err);

      // Caso: programa existe pero está inactivo
      if (err.message === "EXISTS_INACTIVE" && err.existing) {
        throw { message: "EXISTS_INACTIVE", existing: err.existing };
      }

      // Caso: programa ya existe activo
      if (err.message === "EXISTS_ACTIVE" && err.existing) {
        throw { message: "EXISTS_ACTIVE", existing: err.existing };
      }

      // Otros errores
      set({ error: "Error al crear el programa" });
      throw err;
    }
  },

  /**
   * updateProgram: actualiza los datos de un programa existente
   * Reemplaza el programa en el estado con la versión actualizada
   */
  updateProgram: async (codigo: string, updated: Program) => {
    try {
      const updatedProgram = await updateProgram(updated);
      console.log("[Store] Programa actualizado:", updatedProgram);

      set((state) => ({
        programs: state.programs.map((p) =>
          p.codigo === codigo ? updatedProgram : p
        ),
        error: null,
      }));
    } catch (err: any) {
      console.error("[Store] Error al actualizar programa:", err);

      if (err.message === "NAME_EXISTS" && err.existing) {
        throw { message: "NAME_EXISTS", existing: err.existing };
      }

      if (err.message === "NOT_FOUND") {
        throw { message: "NOT_FOUND" };
      }

      set({ error: "Error al actualizar el programa" });
      throw err;
    }
  },

  /**
   * getProgramByCode: obtiene un programa específico por código
   */
  getProgramByCode: async (codigo: string) => {
    try {
      return await getProgramByCode(codigo);
    } catch (err: any) {
      console.error("[Store] Error al obtener programa:", err);
      return null;
    }
  },

  /**
   * searchPrograms: busca programas por término de búsqueda
   */
  searchPrograms: async (searchTerm: string) => {
    try {
      return await searchPrograms(searchTerm);
    } catch (err: any) {
      console.error("[Store] Error al buscar programas:", err);
      return [];
    }
  },

  /**
   * getProgramStats: obtiene estadísticas de programas
   */
  getProgramStats: async () => {
    try {
      return await getProgramStats();
    } catch (err: any) {
      console.error("[Store] Error al obtener estadísticas:", err);
      return { total: 0, active: 0, byFaculty: {} };
    }
  },
}));
