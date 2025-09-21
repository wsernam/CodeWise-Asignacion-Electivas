// Importamos la interfaz de Electiva para tipado fuerte
import type { IElective } from "../Models/elective";

// Lista en memoria que almacena las electivas
// Cada objeto representa una materia electiva
let electives: IElective[] = [
  {
    codigo: "101",
    nombre: "Inteligencia Artificial",
    programa: "Ingeniería",
    active: true,
  },
  {
    codigo: "102",
    nombre: "Ciberseguridad",
    programa: "Ingeniería",
    active: true,
  },
  {
    codigo: "103",
    nombre: "Historia del Arte",
    programa: "Humanidades",
    active: true,
  },
];

/**
 * Obtener todas las electivas
 * @returns Promise<IElective[]> - Lista completa de electivas
 */
export const getElectivesService = async (): Promise<IElective[]> => {
  return electives;
};

/**
 * Crear una nueva electiva
 * Verifica que no exista otra con el mismo código o nombre (ignorando mayúsculas/minúsculas)
 * @param elective - Objeto con los datos de la nueva electiva
 * @returns Promise<IElective> - Electiva creada
 * @throws Error si la electiva ya existe activa o inactiva
 */
export const createElectiveService = async (
  elective: IElective
): Promise<IElective> => {
  const existing = electives.find(
    (e) =>
      e.codigo === elective.codigo ||
      e.nombre.toLowerCase() === elective.nombre.toLowerCase()
  );

  if (existing) {
    if (!existing.active) {
      // Si ya existe pero está inactiva, lanzamos error específico con la electiva inactiva
      const error: any = new Error("EXISTS_INACTIVE");
      error.existing = existing;
      throw error;
    }
    // Si ya existe activa, lanzamos otro error indicando que no se puede duplicar
    const error: any = new Error("EXISTS_ACTIVE");
    error.existing = existing;
    throw error;
  }

  // Si no existe, la agregamos a la lista
  electives.push(elective);
  return elective;
};

/**
 * Actualizar una electiva existente
 * @param codigo - Código de la electiva a actualizar
 * @param updated - Objeto con los nuevos datos
 * @returns Promise<IElective> - Electiva actualizada
 * @throws Error si no se encuentra la electiva
 */
export const updateElectiveService = async (
  codigo: string,
  updated: IElective
): Promise<IElective> => {
  const index = electives.findIndex((e) => e.codigo === codigo);
  if (index === -1) throw new Error("NOT_FOUND"); // No existe la electiva

  // Actualizamos los datos y aseguramos que quede activa
  electives[index] = { ...updated, active: true };
  return electives[index];
};

/**
 * Eliminar una electiva (desactivar)
 * No se borra de la lista, solo se marca como inactiva
 * @param codigo - Código de la electiva a eliminar
 * @returns Promise<IElective> - Electiva desactivada
 * @throws Error si no se encuentra la electiva
 */
export const deleteElectiveService = async (
  codigo: string
): Promise<IElective> => {
  const index = electives.findIndex((e) => e.codigo === codigo);
  if (index === -1) throw new Error("NOT_FOUND");

  electives[index].active = false; // Marcamos como inactiva
  return electives[index];
};

/**
 * Reactivar una electiva previamente desactivada
 * @param codigo - Código de la electiva a reactivar
 * @returns Promise<IElective> - Electiva reactivada
 * @throws Error si no se encuentra la electiva
 */
export const reactivateElectiveService = async (
  codigo: string
): Promise<IElective> => {
  const index = electives.findIndex((e) => e.codigo === codigo);
  if (index === -1) throw new Error("NOT_FOUND");

  electives[index].active = true; // Marcamos como activa
  return electives[index];
};
