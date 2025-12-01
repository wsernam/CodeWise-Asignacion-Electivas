import { create } from "zustand";
import {
  login,
  logout,
  getAccessToken,
  getUserRole,
} from "../../services/Auth/authService";

type Role = "administrador" | "asignador" | "ambos" | null;

interface AuthState {
  token: string | null;
  role: Role;
  userId: string | null;
  loading: boolean;
  error: string | null;

  loginAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

/**
 * Store de autenticación para usuarios Administrador y Asignador
 */
export const useAuthStore = create<AuthState>((set) => ({
  // ESTADO INICIAL
  token: null,
  role: null,
  userId: null,
  loading: false,
  error: null,

  /**
   * Inicializa la autenticación desde localStorage
   * Se ejecuta al cargar la aplicación
   */
  initializeAuth: () => {
    const token = getAccessToken();
    if (token) {
      const backendRole = getUserRole(); // "Administrador" o "Asignador"
      const mappedRole =
        backendRole === "Administrador"
          ? "administrador"
          : backendRole === "Asignador"
          ? "asignador"
          : backendRole === "Ambos"
          ? "ambos"
          : null;

      set({
        token,
        role: mappedRole,
        userId: null, // Se puede extraer del token si es necesario
      });
    }
  },

  loginAdmin: async (username: string, password: string) => {
    set({ loading: true, error: null });

    try {
      // Llamar al servicio de login
      const data = await login(username, password);

      // Obtener rol del token decodificado
      const backendRole = getUserRole();
      const mappedRole =
        backendRole === "Administrador"
          ? "administrador"
          : backendRole === "Asignador"
          ? "asignador"
          : backendRole === "Ambos"
          ? "ambos"
          : null;

      // Actualizar estado
      set({
        token: data.access,
        role: mappedRole,
        userId: username,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("[AuthStore] Error en login:", err);
      set({
        error: err.response?.data?.detail || "Credenciales inválidas",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Cierra la sesión y limpia todo el estado
   */
  logout: () => {
    logout(); // Llama al servicio
    set({
      token: null,
      role: null,
      userId: null,
      loading: false,
      error: null,
    });
  },
}));
