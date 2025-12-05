import { create } from "zustand";
import type { AssignmentProcess } from "../../models/Assignment/assignmentProcess";

interface ProcessWithStatus extends AssignmentProcess {
  estado: "activo" | "finalizado" | "cancelado";
  fecha_finalizacion?: string;
}

interface HistoryState {
  // ========== ESTADO ==========
  procesos: ProcessWithStatus[]; // Lista de procesos históricos
  loading: boolean; // Estado de carga
  error: string | null; // Mensajes de error

  // ========== ACCIONES ==========
  listarProcesos: () => Promise<ProcessWithStatus[]>;
  agregarProceso: (proceso: AssignmentProcess) => void;
  actualizarEstadoProceso: (
    procesoId: number,
    estado: "activo" | "finalizado" | "cancelado"
  ) => void;
  obtenerProcesoPorId: (procesoId: number) => ProcessWithStatus | undefined;
  clearError: () => void;
  reset: () => void;
}

/**
 * STORE PARA HISTORIAL DE PROCESOS DE ASIGNACIÓN
 *
 * Este store maneja el listado y gestión del historial de procesos.
 * Los datos se persisten localmente (localStorage) ya que el backend
 * probablemente no tenga endpoints para historial aún.
 */
const useHistoryStore = create<HistoryState>((set, get) => {
  const loadFromLocalStorage = (): ProcessWithStatus[] => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem("assignment-process-history");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("[HistoryStore] Error loading from localStorage:", error);
    }

    return [];
  };

  const saveToLocalStorage = (procesos: ProcessWithStatus[]) => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "assignment-process-history",
        JSON.stringify(procesos)
      );
    } catch (error) {
      console.error("[HistoryStore] Error saving to localStorage:", error);
    }
  };

  return {
    // ========== ESTADO INICIAL ==========
    procesos: loadFromLocalStorage(),
    loading: false,
    error: null,

    // ========== ACCIONES ==========

    /**
     * LISTAR TODOS LOS PROCESOS DEL HISTORIAL
     * @returns Lista de procesos ordenados por fecha (más reciente primero)
     * En AssignmentModule para mostrar el historial
     */
    listarProcesos: async (): Promise<ProcessWithStatus[]> => {
      set({ loading: true, error: null });
      try {
        // const procesosBackend = await assignmentProcessService.listarProcesos();

        const procesos = get().procesos;

        const procesosOrdenados = [...procesos].sort((a, b) => {
          if (a.pa_anio !== b.pa_anio) return b.pa_anio - a.pa_anio;
          return b.pa_num_semestre - a.pa_num_semestre;
        });

        set({ loading: false });
        return procesosOrdenados;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    /**
     * AGREGAR NUEVO PROCESO AL HISTORIAL
     * @param proceso - Proceso recién creado
     *En CreateAssignmentProcess después de crear proceso exitosamente
     */
    agregarProceso: (proceso: AssignmentProcess) => {
      const nuevoProceso: ProcessWithStatus = {
        ...proceso,
        estado: "activo",
        fecha_finalizacion: undefined,
      };

      set((state) => {
        const nuevosProcesos = [nuevoProceso, ...state.procesos];
        saveToLocalStorage(nuevosProcesos);
        return { procesos: nuevosProcesos };
      });

      console.log(
        "[HistoryStore] Proceso agregado al historial:",
        nuevoProceso
      );
    },

    /**
     * ACTUALIZAR ESTADO DE UN PROCESO
     * @param procesoId - ID del proceso a actualizar
     * @param estado - Nuevo estado ('activo' | 'finalizado' | 'cancelado')
     * Al completar o cancelar un proceso
     */
    actualizarEstadoProceso: (
      procesoId: number,
      estado: "activo" | "finalizado" | "cancelado"
    ) => {
      set((state) => {
        const nuevosProcesos = state.procesos.map((proceso) =>
          proceso.pa_codigo === procesoId
            ? {
                ...proceso,
                estado,
                fecha_finalizacion:
                  estado !== "activo"
                    ? new Date().toISOString().split("T")[0]
                    : undefined,
              }
            : proceso
        );

        saveToLocalStorage(nuevosProcesos);
        return { procesos: nuevosProcesos };
      });

      console.log(`[HistoryStore] Proceso ${procesoId} actualizado a:`, estado);
    },

    /**
     * OBTENER PROCESO ESPECÍFICO POR ID
     * @param procesoId - ID del proceso a buscar
     * @returns Proceso encontrado o undefined
     */
    obtenerProcesoPorId: (procesoId: number) => {
      return get().procesos.find((p) => p.pa_codigo === procesoId);
    },

    clearError: () => set({ error: null }),

    reset: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("assignment-process-history");
      }
      set({
        procesos: [],
        loading: false,
        error: null,
      });
    },
  };
});

export { useHistoryStore };
