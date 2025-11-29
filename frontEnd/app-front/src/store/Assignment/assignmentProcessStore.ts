import { create } from "zustand";
import { assignmentProcessService } from "../../services/Assignment";
import type { AssignmentProcess } from "../../models/Assignment/assignmentProcess";
import type { CodeBatchesResponse } from "../../models/Assignment/assignmentProcess";



interface AssignmentProcessState {
  // ========== ESTADO ==========
  currentProcess: AssignmentProcess | null; // Proceso de asignación actual
  allProcess: AssignmentProcess[]; // Todos los procesos de asignación
  loading: boolean; // Estado de carga para operaciones
  error: string | null; // Mensajes de error

  // ========== ACCIONES ==========
  crearProceso: (anio: number, semestre: number) => Promise<AssignmentProcess>;
  obtenerProcesoActivo: () => Promise<AssignmentProcess | null>;
  obtenerTodosLosProcesos: () => Promise<AssignmentProcess[]>;
  finalizarProceso: (procesoId: number) => Promise<void>;
  eliminarProceso: (procesoId: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

interface CodeBatchState {
  loading: boolean;
  error: string | null;
  data : CodeBatchesResponse | null;
  fetchCodeBatches: (anio: number, semestre: number) => Promise<CodeBatchesResponse>;
  downloadCodeBatchesPDF: (anio: number, semestre: number) => Promise<Blob>;
  clear: () => void;
}

/**
 * GESTIÓN DE PROCESOS DE ASIGNACIÓN
 * Este store maneja la creación y consulta de procesos de asignación.
 * Se usa en el componente CreateProcess para iniciar nuevos procesos.
 */
export const useAssignmentProcessStore = create<AssignmentProcessState>(
  (set, get) => ({
    // ========== ESTADO INICIAL ==========
    currentProcess: null,
    allProcess: [],
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

    /**
     * OBTENER TODOS LOS PROCESOS DE ASIGNACIÓN
     * Se conecta con: assignmentProcessService.obtenerTodosLosProcesos()
     * @returns Lista completa de procesos
     */
    obtenerTodosLosProcesos: async () => {
      set({ loading: true, error: null });
      try {
        const procesos =
          await assignmentProcessService.obtenerTodosLosProcesos();
        set({ allProcess: procesos, loading: false });
        return procesos;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },
    /**
     * FINALIZAR PROCESO DE ASIGNACIÓN
     * @param codigo - Código del proceso a finalizar
     */
    finalizarProceso: async (codigo: number) => {
      set({ loading: true, error: null });
      try {
        await assignmentProcessService.finalizarProceso(codigo);
        set({
          currentProcess: null,
          loading: false,
        });
      } catch (error: any) {
        set({
          loading: false,
          error: error.message,
        });
        throw error;
      }
    },

    /**
     * ELIMINAR PROCESO DE ASIGNACIÓN
     * @param codigo - Código del proceso a eliminar
     */

    eliminarProceso: async (codigo: number) => {
      set({ loading: true, error: null });
      try {
        await assignmentProcessService.eliminarProceso(codigo);
        console.log("Proceso eliminado:", codigo);
        set({
          currentProcess: null,
          loading: false,
        });
      } catch (error: any) {
        set({
          loading: false,
          error: error.message,
        });
        throw error;
      }
    },
    
    // dentro del create(...)
    
    ejecutarAsignacion: async (): Promise<any> => {
      set({ loading: true, error: null });

      try {
        const proc = get().currentProcess; // <- aquí usamos get()
        if (!proc) throw new Error("No hay proceso activo.");

        const result = await assignmentProcessService.ejecutarAsignacion(
          proc.pa_anio,
          proc.pa_num_semestre
          // opcional: "PIS"
        );

        set({ loading: false });
        return result;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
  },
  

  })
);

export const useCodeBatchStore = create<CodeBatchState>((set) => ({
  loading: false,
  error: null,
  data: null,
  fetchCodeBatches: async (anio: number, semestre: number) => {
    set({ loading: true, error: null });
    try {
      const data = await assignmentProcessService.getCodeBatches(anio, semestre);
      set({ data, loading: false });
      return data;
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
  downloadCodeBatchesPDF: async (anio: number, semestre: number) => {
    set({ loading: true, error: null });
    try {
      const data = await assignmentProcessService.downloadCodeBatches(anio, semestre);
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
  clear: () => set({ data: null, error: null })
}));
