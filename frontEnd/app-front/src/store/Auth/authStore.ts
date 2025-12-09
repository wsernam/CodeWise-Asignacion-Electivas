import { create } from "zustand";
import {
  login,
  logout,
  verifyAndRefreshToken,
} from "../../services/Auth/authService";
import { jwtDecode } from "jwt-decode";

type Role = "administrador" | "asignador" | "ambos" | null;

interface AuthState {
  token: string | null;
  role: Role;
  username: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean; // ← NUEVO: para saber si ya se verificó

  loginAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>; // ← Ahora es async
}

export const useAuthStore = create<AuthState>((set) => ({
  // ESTADO INICIAL
  token: null,
  role: null,
  username: null,
  userId: null,
  loading: false,
  error: null,
  isInitialized: false, // ← NUEVO

  /**
   * Inicializa la autenticación verificando y refrescando el token si es necesario
   */
  initializeAuth: async () => {
    set({ loading: true });

    try {
      const tokenData = await verifyAndRefreshToken();

      if (!tokenData) {
        // No hay sesión válida
        set({
          token: null,
          role: null,
          username: null,
          userId: null,
          loading: false,
          isInitialized: true,
        });
        return;
      }

      // Normalizar rol
      const backendRole = tokenData.role;
      let mappedRole: Role = null;

      if (backendRole) {
        const normalizedRole = backendRole.toLowerCase();
        if (normalizedRole === "administrador") {
          mappedRole = "administrador";
        } else if (normalizedRole === "asignador") {
          mappedRole = "asignador";
        } else if (normalizedRole === "ambos") {
          mappedRole = "ambos";
        }
      }

      set({
        token: tokenData.access,
        role: mappedRole,
        username: tokenData.username || null,
        userId: tokenData.userId || null,
        loading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("[AuthStore] Error inicializando auth:", error);
      set({
        token: null,
        role: null,
        username: null,
        userId: null,
        loading: false,
        isInitialized: true,
      });
    }
  },

  loginAdmin: async (username: string, password: string) => {
    set({ loading: true, error: null });

    try {
      const data = await login(username, password);
      const decodedToken: any = jwtDecode(data.access);
      const backendRole = decodedToken.role;

      // Normalizar a minúscula
      let mappedRole: Role = null;
      if (backendRole) {
        const normalizedRole = backendRole.toLowerCase();

        if (normalizedRole === "administrador") {
          mappedRole = "administrador";
        } else if (normalizedRole === "asignador") {
          mappedRole = "asignador";
        } else if (normalizedRole === "ambos") {
          mappedRole = "ambos";
        }
      }

      // Actualizar estado
      set({
        token: data.access,
        role: mappedRole,
        username: username,
        userId: decodedToken.user_id || null,
        loading: false,
        error: null,
        isInitialized: true, // ← NUEVO
      });
    } catch (err: any) {
      console.error("[AuthStore] Error en login:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Credenciales inválidas";
      set({
        error: errorMessage,
        loading: false,
      });
      throw err;
    }
  },

  logout: () => {
    logout();
    set({
      token: null,
      role: null,
      username: null,
      userId: null,
      loading: false,
      error: null,
      isInitialized: true, // ← Mantener en true
    });
  },
}));