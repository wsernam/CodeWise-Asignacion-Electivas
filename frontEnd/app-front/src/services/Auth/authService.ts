import { LOGIN_URL } from "../config/config";
/**
 * @brief Servicio de autenticacion del administrador y asignador.
 *
 * Envia credenciales al backend y retorna el token JWT en caso de exito.
 *
 * @param username - Nombre de usuario del administrador / asignador.
 * @param password - Contraseña del administrador / asignador.
 * @returns Objeto JSON con el token de sesion.
 * @throws Error si la peticion falla.
 */
export const loginAdminService = async (username: string, password: string) => {
  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

/**
 * @brief Servicio de autenticacion del estudiante.
 *
 * Envia identificador al backend y retorna la informacion correspondiente en caso de exito.
 *
 * @param username - El nombre de usuario del estudiante.
 * @returns Datos del estudiante o undefined en caso de error.
 */
export const loginStudentService = async (username: string) => {
  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
      return await response.json();
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};
