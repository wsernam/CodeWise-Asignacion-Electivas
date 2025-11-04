import { create } from "zustand";
import { assignmentProcessService } from "../../services/Assignment";
import type { AssignmentProcess } from "../../models/Assignment/assignmentProcess";

interface AssignmentProcessState {
  // ========== ESTADO ==========
  currentProcess: AssignmentProcess | null; // Proceso de asignación actual
  loading: boolean; // Estado de carga para operaciones
  error: string | null; // Mensajes de error

  // ========== ACCIONES ==========
  crearProceso: (anio: number, semestre: number) => Promise<AssignmentProcess>;
  obtenerProcesoActivo: () => Promise<AssignmentProcess | null>;
  clearError: () => void;
  reset: () => void;
}

/**
 * GESTIÓN DE PROCESOS DE ASIGNACIÓN
 * Este store maneja la creación y consulta de procesos de asignación.
 * Se usa en el componente CreateProcess para iniciar nuevos procesos.
 */
export const useAssignmentProcessStore = create<AssignmentProcessState>(
  (set) => ({
    // ========== ESTADO INICIAL ==========
    currentProcess: null,
    loading: false,
    error: null,

    // ========== ACCIONES ==========

    /**
     * CREAR NUEVO PROCESO DE ASIGNACIÓN
     * Se conecta con: assignmentProcessService.crearProceso()
     * @param anio - Año académico para el proceso
     * @param semestre - Semestre (1 o 2) para el proceso
     * @returns Proceso creado con código único
     * En CreateProcess cuando se guarda un nuevo proceso
     */
    crearProceso: async (anio: number, semestre: number) => {
      set({ loading: true, error: null });
      try {
        const proceso = await assignmentProcessService.crearProceso(
          anio,
          semestre
        );
        set({ currentProcess: proceso, loading: false });
        return proceso;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    /**
     * OBTENER PROCESO DE ASIGNACIÓN ACTIVO ACTUAL
     * Se conecta con: assignmentProcessService.obtenerProcesoActivo()
     * @returns Proceso activo actual o null si no hay ninguno
     * Para verificar si ya existe un proceso en curso al cargar la app
     */
    obtenerProcesoActivo: async () => {
      set({ loading: true, error: null });
      try {
        const proceso = await assignmentProcessService.obtenerProcesoActivo();
        set({ currentProcess: proceso, loading: false });
        return proceso;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    /**
     * LIMPIAR MENSAJES DE ERROR
     */
    clearError: () => set({ error: null }),

    /**
     * REINICIAR STORE A ESTADO INICIAL
     */
    reset: () =>
      set({
        currentProcess: null,
        loading: false,
        error: null,
      }),
  })
);
