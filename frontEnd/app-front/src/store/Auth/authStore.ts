import { create } from "zustand";
import {
  loginAdminService,
  loginStudentService,
} from "../../services/Auth/authService";

type Role = "estudiante" | "administrador" | "asignador" | null;

interface AuthState {
  token: string | null;
  role: Role;
  userId: number | null; // Codigo del estudiante o ID del usuario
  loading: boolean;
  error: string | null;

  // Métodos de autenticación
  loginStudent: (code: string) => Promise<void>;
  loginAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  userId: null,
  loading: false,
  error: null,

  loginStudent: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const data = await loginStudentService(code.toString());
      if (!data) throw new Error("[authStore] Estudiante no encontrado");

      set({
        token: data.token ?? null,
        role: "estudiante",
        userId: data.codigo ?? null,
        loading: false,
      });

      // Almacena el token en localStorage
      if (data.token) localStorage.setItem("authToken", data.token);
    } catch (err: any) {
      set({
        error: "[authStore] Error en el inicio de sesión del estudiante",
        loading: false,
      });
      throw err;
    }
  },

  loginAdmin: async (username: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const data = await loginAdminService(username, password);
      if (!data || !data.token)
        throw new Error("[authStore] Credenciales inválidas");

      set({
        token: data.token,
        role: data.role,
        userId: data.userId ?? null,
        loading: false,
      });

      localStorage.setItem("authToken", data.token);
    } catch (err: any) {
      set({
        error: "[authStore] Error en el inicio de sesión del administrador",
        loading: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    set({ token: null, role: null, userId: null, loading: false, error: null });
  },
}));
