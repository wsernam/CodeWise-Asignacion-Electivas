import { create } from "zustand";
import { niveladosService } from "../../services/Assignment";
import type {
  LeveledStudent,
  ConfirmLeveledRequest,
} from "../../models/Assignment/assignmentProcess";

interface NiveladosState {
  // ========== ESTADO ==========
  leveledStudents: LeveledStudent[];
  confirmedLeveledStudents: ConfirmLeveledRequest[];
  loading: boolean;
  error: string | null;

  // ========== ACCIONES ==========
  gestionarNivelados: (
    anio: number,
    semestre: number
  ) => Promise<{ message: string }>;
  
  listarNivelados: (
    anio: number,
    semestre: number
  ) => Promise<LeveledStudent[]>;
  
  confirmarNivelados: (
    anio: number,
    semestre: number,
    estudiantes: ConfirmLeveledRequest[]
  ) => Promise<{ message: string }>;
  setLeveledStudents: (students: LeveledStudent[]) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * GESTIÓN DE ESTUDIANTES NIVELADOS
 * Este store maneja la identificación, listado y confirmación
 * de estudiantes que cumplen criterios para ser considerados "nivelados".
 * Se usa en LevelsManagementAP.
 */
export const useNiveladosStore = create<NiveladosState>((set) => ({
  // ========== ESTADO INICIAL ==========
  leveledStudents: [],
  confirmedLeveledStudents: [],
  loading: false,
  error: null,

  // ========== ACCIONES ==========

  /**
   * CALCULAR ESTUDIANTES NIVELADOS AUTOMÁTICAMENTE
   * Se conecta con: niveladosService.gestionarNivelados()
   * @param anio - Año del proceso
   * @param semestre - Semestre del proceso
   * @returns Mensaje de confirmación
   * Al iniciar el paso de nivelados, para calcular criterios automáticamente
   */
  gestionarNivelados: async (anio: number, semestre: number) => {
    set({ loading: true, error: null });
    try {
      console.log("[NiveladosStore] Gestionando nivelados para: ", anio, semestre);
      const result = await niveladosService.gestionarNivelados(anio, semestre);
      set({ loading: false });
      console.log("[NiveladosStore] Resultado de gestionarNivelados: ", result);
      return result;
    } catch (error: any) {
      console.error("[NiveladosStore] Error gestionando nivelados:", error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * OBTENER LISTA DE ESTUDIANTES IDENTIFICADOS COMO NIVELADOS
   * Se conecta con: niveladosService.listarNivelados()
   * @param anio - Año del proceso
   * @param semestre - Semestre del proceso
   * @returns Lista de estudiantes nivelados con datos académicos
   * En LevelsManagementAP para mostrar estudiantes a confirmar
   */
  listarNivelados: async (anio: number, semestre: number) => {
    set({ loading: true, error: null });
    try {
      console.log("[NiveladosStore] Listando nivelados para: ", anio, semestre);
      const result = await niveladosService.listarNivelados(anio, semestre);
      set({ leveledStudents: result, loading: false });
      console.log("[NiveladosStore] Estudiantes nivelados obtenidos: ", result);
      return result;
    } catch (error: any) {
      console.error("[NiveladosStore] Error listando nivelados:", error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * CONFIRMAR ESTUDIANTES COMO NIVELADOS
   * Se conecta con: niveladosService.confirmarNivelados()
   * @param anio - Año del proceso
   * @param semestre - Semestre del proceso
   * @param estudiantes - Lista de estudiantes a confirmar
   * @returns Mensaje de confirmación
   * En LevelsManagementAP cuando el usuario confirma la lista
   */
  confirmarNivelados: async (
    anio: number,
    semestre: number,
    estudiantes: ConfirmLeveledRequest[]
  ) => {
    set({ loading: true, error: null });
    try {
      console.log("[NiveladosStore] Confirmando nivelados para: ", anio, semestre, estudiantes);
      const result = await niveladosService.confirmarNivelados(
        anio,
        semestre,
        estudiantes
      );
      set({ confirmedLeveledStudents: estudiantes, loading: false });
      console.log("[NiveladosStore] Resultado de confirmarNivelados: ", result);
      return result;
    } catch (error: any) {
      console.error("[NiveladosStore] Error confirmando nivelados:", error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * ACTUALIZAR LISTA DE ESTUDIANTES NIVELADOS MANUALMENTE
   * Para actualizaciones locales sin llamar al backend
   */
  setLeveledStudents: (students: LeveledStudent[]) =>
    set({ leveledStudents: students }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      leveledStudents: [],
      confirmedLeveledStudents: [],
      loading: false,
      error: null,
    }),
}));
