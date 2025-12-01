import apiClient from "../Auth/apiClient";
import { STUDENT_URL_PUBLIC } from "../config/config";
import type { IStudent } from "../../models/Form/student";

// ========== HELPERS ==========
const transformStudent = (item: any): IStudent => ({
  est_codigo: item.est_codigo,
  est_nombre: item.est_nombre,
  est_apellido: item.est_apellido,
  est_correo: item.est_correo,
  pro_codigo: item.pro_codigo,
  est_estado: true,
});

// ========== FUNCIONES DE CONEXIÓN CON BACKEND ==========

/**
 * Obtiene todos los estudiantes
 */
export const getStudentsService = async (): Promise<IStudent[]> => {
  try {
    const response = await apiClient.get(`${STUDENT_URL_PUBLIC}/`);
    console.log("[studentService] Estudiante recuperado:", response.data);

    const transformed: IStudent[] = Array.isArray(response.data)
      ? response.data.map(transformStudent)
      : [];
    console.log("[studentService] Datos transformados:", transformed);

    return transformed;
  } catch (error: any) {
    console.error("[studentService] Error obteniendo estudiantes:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudieron cargar los estudiantes"
    );
  }
};

/**
 * Obtiene un estudiante por código
 * @param codigo - Código del estudiante
 */
export const getStudentById = async (
  codigo: number
): Promise<IStudent | null> => {
  try {
    console.log(
      "[studentService] Conectando a:",
      `${STUDENT_URL_PUBLIC}/${codigo}/`
    );
    const response = await apiClient.get(`${STUDENT_URL_PUBLIC}/${codigo}/`);
    const transformed = transformStudent(response.data);
    console.log("[studentService] Estudiante obtenido:", transformed);
    return transformed;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("[studentService] No se encontraron estudiantes (404)");
      return null;
    }

    console.error("[studentService] Error obteniendo estudiante:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo cargar el estudiante"
    );
  }
};

/**
 * Crea un nuevo estudiante
 * @param student - Datos del estudiante a crear
 */
export const createStudent = async (student: IStudent): Promise<IStudent> => {
  try {
    console.log("[studentService] Creando estudiante:", student);
    const response = await apiClient.post(`${STUDENT_URL_PUBLIC}/`, student);
    const created = transformStudent(response.data);
    console.log("[studentService] Estudiante creado:", created);
    return created;
  } catch (error: any) {
    console.error("[studentService] Error creando estudiante:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo crear el estudiante"
    );
  }
};

/**
 * Actualizar un estudiante por código
 */
export const updateStudent = async (
  code: number,
  student: IStudent
): Promise<IStudent> => {
  try {
    console.log(
      "[studentService] Actualizando estudiante:",
      student.est_codigo,
      student
    );
    const response = await apiClient.put(
      `${STUDENT_URL_PUBLIC}/${code}/`,
      student
    );
    const updated = transformStudent(response.data);
    console.log("[studentService] Estudiante actualizado:", updated);
    return updated;
  } catch (error: any) {
    console.error("[studentService] Error actualizando estudiante:", error);
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo actualizar el estudiante"
    );
  }
};

/**
 * Actualizar estado del estudiante
 */
export const updateStudentStatus = async (
  code: number,
  status: boolean
): Promise<IStudent> => {
  try {
    console.log("[studentService] Actualizando estado del estudiante: ", code);
    const response = await apiClient.patch(
      `${STUDENT_URL_PUBLIC}/${code}/`,
      { est_estado: status } // Enviar como objeto
    );
    const updated = transformStudent(response.data);
    console.log("[studentService] Estado del estudiante actualizado:", updated);
    return updated;
  } catch (error: any) {
    console.error(
      "[studentService] Error actualizando estado del estudiante:",
      error
    );
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo actualizar el estado del estudiante"
    );
  }
};
