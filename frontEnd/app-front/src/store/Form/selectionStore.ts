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
      set({
        loading: false,
        error: "[selectionStore] Error al crear selección",
      });
      throw err;
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

  logout: () => set({ student: null, selection: null, error: null }),
}));
