// TODO VERIFICAR
//Este servicio manejará toda la lógica relacionada con el login, logout y el almacenamiento de tokens.

import axios from "axios";
import { AUTH_API_BASE_URL } from "../config/config";
import { jwtDecode } from "jwt-decode";

interface AuthResponse {
  access: string;
  refresh: string;
}

interface DecodedToken {
  role: string;
  // Aquí puedes añadir otros campos que esperes en el token, como user_id, exp, etc.
}

/**
 * Almacena los tokens de autenticación en localStorage.
 * @param access - El token de acceso.
 * @param refresh - El token de refresco.
 */
const setAuthTokens = (access: string, refresh: string): void => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

/**
 * Elimina los tokens de autenticación de localStorage.
 */
const removeAuthTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/**
 * Realiza la petición de login al backend.
 * @param username - El nombre de usuario (o email).
 * @param password - La contraseña.
 * @returns Una promesa que se resuelve con la respuesta de autenticación.
 */
export const login = async (
  username: any,
  password: any
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(AUTH_API_BASE_URL, {
      // El backend espera 'username', si usas email, cámbialo aquí.
      username,
      password,
    });

    const { access, refresh } = response.data;
    setAuthTokens(access, refresh);

    return response.data;
  } catch (error) {
    console.error("Error durante el login:", error);
    // Propaga el error para que el componente que llama pueda manejarlo (e.g., mostrar un mensaje al usuario)
    throw error;
  }
};

/**
 * Cierra la sesión del usuario eliminando los tokens.
 */
export const logout = (): void => {
  window.location.href = "/";
  removeAuthTokens();
};

/**
 * Obtiene el token de acceso almacenado.
 */
export const getAccessToken = (): string | null =>
  localStorage.getItem("accessToken");

/**
 * Obtiene el token de refresco almacenado.
 */
export const getRefreshToken = (): string | null =>
  localStorage.getItem("refreshToken");

/**
 * Decodifica el token de acceso y devuelve el rol del usuario.
 * @returns El rol del usuario (ej. "Asignador") o null si no hay token o este es inválido.
 */
export const getUserRole = (): string | null => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  try {
    const decodedToken: DecodedToken = jwtDecode(token);
    return decodedToken.role;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};
