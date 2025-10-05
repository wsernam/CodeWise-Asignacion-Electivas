// stores/studentStore.ts
import { create } from "zustand";
import type { IStudent } from "../models/student";
import type { IElective } from "../models/elective";

import {
  getStudentsService,
  getStudentByCode,
  createStudentService,
  getActiveElectivesForProgram,
} from "../services/studentService";

interface StudentState {
  students: IStudent[];
  loading: boolean;
  error: string | null;
  activeElectives: IElective[];

  fetchStudents: () => Promise<void>;
  getStudentByCode: (codigo: string) => Promise<IStudent | null>;
  addStudent: (student: IStudent) => Promise<void>;
  fetchActiveElectives: (programa: string) => Promise<void>;
  clearError: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loading: false,
  error: null,
  activeElectives: [],

  clearError: () => set({ error: null }),

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getStudentsService();
      set({ students: [...data], loading: false });
    } catch (err: any) {
      set({
        students: [],
        loading: false,
        error: "Error al cargar estudiantes",
      });
    }
  },

  getStudentByCode: async (codigo: string) => {
    try {
      return await getStudentByCode(codigo);
    } catch (err: any) {
      return null;
    }
  },

  addStudent: async (student: IStudent) => {
    try {
      const newStudent = await createStudentService(student);
      set((state) => ({
        students: [...state.students, newStudent],
        error: null,
      }));
    } catch (err: any) {
      if (err.message === "EXISTS_ACTIVE") {
        throw { message: "EXISTS_ACTIVE", existing: err.existing };
      }
      if (err.message === "INVALID_ELECTIVES") {
        throw { message: "INVALID_ELECTIVES", details: err.details };
      }
      set({ error: "Error al crear estudiante" });
      throw err;
    }
  },

  fetchActiveElectives: async (programa: string) => {
    set({ loading: true });
    try {
      const electives = await getActiveElectivesForProgram(programa);
      set({ activeElectives: electives, loading: false });
    } catch (err: any) {
      set({ activeElectives: [], loading: false });
    }
  },
}));
