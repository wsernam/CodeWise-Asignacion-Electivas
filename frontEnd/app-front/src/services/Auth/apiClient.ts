import axios from "axios";
import { getAccessToken, getRefreshToken } from "./authService";

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
});

// Interceptor de peticiones: añade el token a cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas: maneja errores 401 (token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos un 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No hay refresh token, redirigir al login
          window.location.href = "/";
          return Promise.reject(error);
        }

        // Intentar refrescar el token
        const response = await axios.post(
          "http://localhost:8000/auth/login/api/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;
        localStorage.setItem("accessToken", access);

        // Reintentar la petición original con el nuevo token
        originalRequest.headers["Authorization"] = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
