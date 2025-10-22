import { create } from "zustand";
import type { ISelectionStudentElective } from "../Models/selection";
import {
    createSelectionService,
} from "../services/selectionService";
import type { IElective } from "../Models/elective";
import type { IStudent } from "../Models/student";
import { getStudentById } from "../services/studentService";
import { useOfferStore } from "./offerStore";

interface SelectionState {
    student: IStudent | null;
    selection: ISelectionStudentElective | null;
    loading: boolean;
    error: string | null;
    activeElectives: IElective[];
    
    addSelection: (selection: ISelectionStudentElective) => Promise<void>;
    fetchStudentById: (code: string) => Promise<IStudent | null>;
    fetchActiveElectives: (programa: string, year:number, semester: number) => Promise<void>;
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
        set ({ loading: true, error: null });
        try {
            const newSelection = await createSelectionService(selection);
            set ({ selection: newSelection, loading: false, error: null });
        }
        catch (err: any) {
            set({ loading: false, error: "[selectionStore] Error al crear selección" });
            throw err;
        }
    },

    fetchStudentById: async (code: string) => {
        try {
            return await getStudentById(parseInt(code));
        } catch (err: any) {
            return null;
        }
    },

    fetchActiveElectives: async (programa: string, year: number, semester: number) => {
        const offerStore = useOfferStore.getState();
        set({ loading: true, error: null });
        try {
            const electives = await offerStore.getOffersByProgram(programa, year, semester);
            set({ activeElectives: electives, loading: false });
        } catch (err: any) {
            set({ activeElectives: [], loading: false,  error: "[selectionStore] Error al cargar electivas activas" });
        }
    },

    logout: () => set({ student: null, selection: null, error: null})
}));


