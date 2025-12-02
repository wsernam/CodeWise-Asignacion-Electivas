import { create } from "zustand";
import { login, logout, getAccessToken } from "../../services/Auth/authService";
import { jwtDecode } from "jwt-decode";

type Role = "administrador" | "asignador" | "ambos" | null;

interface AuthState {
  token: string | null;
  role: Role;
  username: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;

  loginAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ESTADO INICIAL
  token: null,
  role: null,
  username: null,
  userId: null,
  loading: false,
  error: null,

  /**
   * Inicializa la autenticación desde localStorage
   */
  initializeAuth: () => {
    const token = getAccessToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
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

        set({
          token,
          role: mappedRole,
          username: decodedToken.username || null, // ← Usa username del token
        });
      } catch (error) {
        console.error("[AuthStore] Error decodificando token:", error);
        logout();
        set({ token: null, role: null, username: null });
      }
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
        username: username, // ← Guarda el username que usó para login
        userId: decodedToken.user_id || null,
        loading: false,
        error: null,
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
    });
  },
}));
