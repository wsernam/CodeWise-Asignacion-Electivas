import { create } from "zustand";
import { assignmentProcessService } from "../../services/Assignment";
import type { AssignmentProcess } from "../../models/Assignment/assignmentProcess";
import type { CodeBatchesResponse } from "../../models/Assignment/assignmentProcess";
import { notificarEstudiantesPeriodo } from "../../services/Assignment/assignmentProcessService";

interface AssignmentProcessState {
  // ========== ESTADO ==========
  currentProcess: AssignmentProcess | null;
  allProcess: AssignmentProcess[];
  loading: boolean;
  error: string | null;

  // ========== ACCIONES ==========
  crearProceso: (anio: number, semestre: number) => Promise<AssignmentProcess>;
  obtenerProcesoActivo: () => Promise<AssignmentProcess | null>;
  obtenerTodosLosProcesos: () => Promise<AssignmentProcess[]>;
  finalizarProceso: (procesoId: number) => Promise<AssignmentProcess>;
  eliminarProceso: (procesoId: number) => Promise<void>;
  eliminarProcesoCompleto: (procesoId: number) => Promise<void>;
  ejecutarAsignacion: () => Promise<any>;
  obtenerUltimoProcesoFinalizado: () => Promise<AssignmentProcess | null>;

  verificarOfertasActivas: (anio: number, semestre: number) => Promise<boolean>;
  verificarCondicionesCreacion: (
    anio: number,
    semestre: number
  ) => Promise<{ puedeCrear: boolean; razones: string[] }>;

  // 👇🔥 AGREGADO AQUÍ
  notificarEstudiantesPeriodo: (
    anio: number,
    semestre: number
  ) => Promise<any>;

  clearError: () => void;
  reset: () => void;
}

interface CodeBatchState {
  loading: boolean;
  error: string | null;
  data: CodeBatchesResponse | null;
  fetchCodeBatches: (
    anio: number,
    semestre: number
  ) => Promise<CodeBatchesResponse>;
  downloadCodeBatchesPDF: (anio: number, semestre: number) => Promise<Blob>;
  clear: () => void;
}

export const useAssignmentProcessStore = create<AssignmentProcessState>(
  (set, get) => ({
    currentProcess: null,
    allProcess: [],
    loading: false,
    error: null,

    // ================================================================
    // CREAR PROCESO
    // ================================================================
    crearProceso: async (anio, semestre) => {
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

    // ================================================================
    // OBTENER PROCESO ACTIVO
    // ================================================================
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

    // ================================================================
    // OBTENER TODOS LOS PROCESOS
    // ================================================================
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

    // ================================================================
    // FINALIZAR PROCESO (DEVUELVE EL PROCESO FINALIZADO)
    // ================================================================
    finalizarProceso: async (codigo: number) => {
      set({ loading: true, error: null });
      try {
        const procesoActualizado =
          await assignmentProcessService.finalizarProceso(codigo);

        set((state) => ({
          allProcess: state.allProcess.map((p) =>
            p.pa_codigo === codigo ? procesoActualizado : p
          ),
          currentProcess: null,
          loading: false,
        }));

        return procesoActualizado;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    // ================================================================
    // ELIMINAR PROCESO
    // ================================================================
    eliminarProceso: async (codigo) => {
      set({ loading: true, error: null });
      try {
        await assignmentProcessService.eliminarProceso(codigo);
        set({ currentProcess: null, loading: false });
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    // ================================================================
    // ELIMINAR PROCESO COMPLETO
    // ================================================================
    eliminarProcesoCompleto: async (codigo) => {
      set({ loading: true, error: null });
      try {
        const proc = get().currentProcess;
        if (!proc || proc.pa_codigo !== codigo) {
          throw new Error("Proceso no encontrado.");
        }

        await assignmentProcessService.purgarAsignaciones(
          proc.pa_anio,
          proc.pa_num_semestre
        );

        await assignmentProcessService.eliminarProceso(codigo);

        set({ currentProcess: null, loading: false });
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    // ================================================================
    // EJECUTAR ASIGNACIÓN
    // ================================================================
    ejecutarAsignacion: async () => {
      set({ loading: true, error: null });
      try {
        const proc = get().currentProcess;
        if (!proc) throw new Error("No hay proceso activo.");

        const result = await assignmentProcessService.ejecutarAsignacion(
          proc.pa_anio,
          proc.pa_num_semestre
        );

        set({ loading: false });
        return result;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    // ================================================================
    // OBTENER ÚLTIMO PROCESO FINALIZADO
    // ================================================================
    obtenerUltimoProcesoFinalizado: async () => {
      set({ loading: true, error: null });

      try {
        const proceso =
          await assignmentProcessService.obtenerUltimoProcesoFinalizado();
        set({ loading: false });
        return proceso;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    // ================================================================
    // VERIFICAR PARA CREAR PROCESO
    // ================================================================
    verificarCondicionesCreacion: async (anio, semestre) => {
      set({ loading: true, error: null });

      const razones: string[] = [];

      try {
        const todosProcesos =
          await assignmentProcessService.obtenerTodosLosProcesos();

        const procesoExistente = todosProcesos.find(
          (p) => p.pa_anio === anio && p.pa_num_semestre === semestre
        );

        if (procesoExistente) {
          razones.push(
            `Ya existe un proceso de asignación para el periodo ${anio}-${semestre}`
          );
        }

        const puedeCrear = razones.length === 0;

        set({ loading: false });
        return { puedeCrear, razones };
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    // ================================================================
    // VERIFICAR OFERTAS ACTIVAS
    // ================================================================
    verificarOfertasActivas: async (anio, semestre) => {
      set({ loading: true, error: null });

      try {
        const hayOfertas =
          await assignmentProcessService.verificarOfertasActivas(
            anio,
            semestre
          );

        set({ loading: false });
        return hayOfertas;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    // ================================================================
    // 🔥🔥 NOTIFICAR ESTUDIANTES DEL PERÍODO 🔥🔥
    // ================================================================
    notificarEstudiantesPeriodo: async (anio: number, semestre: number) => {
      set({ loading: true, error: null });
      try {
        const resp =
          await notificarEstudiantesPeriodo(
            anio,
            semestre
          );

        set({ loading: false });
        return resp;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    clearError: () => set({ error: null }),

    reset: () =>
      set({
        currentProcess: null,
        loading: false,
        error: null,
      }),
  })
);

/* ================================================================
   STORE PARA LOTES DE CÓDIGOS
================================================================ */
export const useCodeBatchStore = create<CodeBatchState>((set) => ({
  loading: false,
  error: null,
  data: null,

  fetchCodeBatches: async (anio, semestre) => {
    set({ loading: true, error: null });
    try {
      const data = await assignmentProcessService.getCodeBatches(
        anio,
        semestre
      );
      set({ data, loading: false });
      return data;
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  downloadCodeBatchesPDF: async (anio, semestre) => {
    set({ loading: true, error: null });
    try {
      const data = await assignmentProcessService.downloadCodeBatches(
        anio,
        semestre
      );
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  clear: () => set({ data: null, error: null }),
}));
