import { create } from "zustand";
import type { ISelectionStudentElective } from "../../models/Form/selection";
import { createSelectionService } from "../../services/Form/selectionService";
import type { IElective } from "../../models/Form/elective";
import type { IStudent } from "../../models/Form/student";
import { getStudentById } from "../../services/Form/studentService";
import { useOfferStore } from "./offerStore";

interface SelectionState {
  student: IStudent | null;
  selection: ISelectionStudentElective | null;
  loading: boolean;
  error: string | null;
  activeElectives: IElective[];

  addSelection: (selection: ISelectionStudentElective) => Promise<void>;
  fetchStudentById: (code: string) => Promise<IStudent | null>;
  fetchActiveElectives: (
    programa: string,
    year: number,
    semester: number
  ) => Promise<void>;
  getLastOfferDate: () => Promise< { ofe_anio: number; ofe_num_semestre: number } >;
  clearError: () => void;
  logout: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  student: null,
  selection: null,
  loading: false,
  error: null,
  activeElectives: [],

  clearError: () => set({ error: null }),

addSelection: async (selection: ISelectionStudentElective) => {
  set({ loading: true, error: null });
  try {
    const newSelection = await createSelectionService(selection);
    set({ selection: newSelection, loading: false, error: null });
    console.log("[selectionStore] Selección creada:", newSelection);
  } catch (err: any) {
    console.log("[selectionStore] Error completo:", err);
    console.log("[selectionStore] Error response:", err?.response);
    console.log("[selectionStore] Error response data:", err?.response?.data);
    
    // Extraemos el mensaje de error específico del backend.
    const errorData = err?.response?.data;
    
    let errorMessage = "Error al crear selección";
    
    if (errorData) {
      // Caso 1: non_field_errors array
      if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        errorMessage = errorData.non_field_errors[0];
      }
      // Caso 2: detail string
      else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
      // Caso 3: Si errorData es directamente un array
      else if (Array.isArray(errorData) && errorData.length > 0) {
        errorMessage = errorData[0];
      }
      // Caso 4: Otros campos de error (field-specific errors)
      else if (typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        if (firstKey && Array.isArray(errorData[firstKey])) {
          errorMessage = errorData[firstKey][0];
        } else if (firstKey) {
          errorMessage = errorData[firstKey];
        }
      }
    }

    console.log("[selectionStore] Mensaje de error procesado:", errorMessage);

    set({
      loading: false,
      error: errorMessage,
    });
    
    // Lanzar el error para que el componente lo capture
    throw new Error(errorMessage);
  }
},
  fetchStudentById: async (code: string) => {
    try {
      console.log("[selectionStore] Buscando estudiante con código:", code);
      return await getStudentById(parseInt(code));
    } catch (err: any) {
      return null;
    }
  },

  fetchActiveElectives: async (
    programa: string,
    year: number,
    semester: number
  ) => {
    const offerStore = useOfferStore.getState();
    set({ loading: true, error: null });
    try {
      const electives = await offerStore.getOffersByProgram(
        programa,
        year,
        semester
      );
      console.log("[selectionStore] Electivas activas obtenidas:", electives);
      set({ activeElectives: electives, loading: false });
    } catch (err: any) {
      set({
        activeElectives: [],
        loading: false,
        error: "[selectionStore] Error al cargar electivas activas",
      });
    }
  },

  getLastOfferDate: async (): Promise< { ofe_anio: number; ofe_num_semestre: number } > => {
    const offerStore = useOfferStore.getState();
    set({ loading: true, error: null });
    try {
      const result = await offerStore.getLastOffersPeriod();
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al obtener la última fecha de oferta",
      });
      throw error;
    }
  },

  logout: () => set({ student: null, selection: null, error: null }),
}));