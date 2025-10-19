import { create } from "zustand";
import type { IStudent } from "../Models/student";
import {
    getStudentsService,
    getStudentById,
    createStudent,
} from "../services/studentService";

// Importación para futura implementación de login
// import { loginStudentService } from "../services/authService";

/**
 * Estado global para manejar estudiantes
 */
 interface StudentState {
    students: IStudent[];
    loading: boolean;
    error: string | null;

    // Métodos
    fetchStudents: () => Promise<void>;
    getStudentById: (codigo: number) => Promise<IStudent | null>;
    addStudent: (student: IStudent) => Promise<void>;
    clearError: () => void;

    loginStudent: (code: string) => Promise<void>;
    logoutStudent: () => void;
}

/**
 * Store de estudiantes usando Zustand
 */

export const useStudentStore = create<StudentState>((set) => ({
    students: [],
    loading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchStudents: async () => {
        set ({ loading: true, error: null });
        try {
            const data = await getStudentsService();
            set ({ students: [...data], loading: false });
        }
        catch (err: any) {
            set ({
                students: [],
                loading: false,
                error: "Error al cargar estudiantes",
            });
        }
    },

    getStudentById: async (codigo: number) => {
        try {
            return await getStudentById(codigo);
        }
        catch (err: any) {
            return null;
        }
    },

    addStudent: async (student: IStudent) => {
        try {
            const newStudent = await createStudent(student);
            set ((state) => ({
                students: [...state.students, newStudent],
                error: null,
            }));
        } catch (err: any) {
            if (err.message === "EXISTS_ACTIVE") {
                throw new Error("EXISTS_ACTIVE");
            }
            set ({ error: "Error al crear estudiante" });
            throw err;
        }
    },

// -------------- SIN IMPLEMENTAR --------------
    loginStudent: async (code: string) => {
        console.log("[studentStore] Pendiente por implementar", code);
        // Llamar al servicio de login
    },

    logoutStudent: () => {},
}));