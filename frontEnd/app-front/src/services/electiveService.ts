import type { IElective } from "../models/elective";

// ========== BASE DE DATOS EN MEMORIA ==========
/*
 * Lista en memoria que almacena las electivas
 * Cada objeto representa una materia electiva con sus propiedades
 * En una aplicación real, esto sería reemplazado por una base de datos
 */
let electives: IElective[] = [
  {
    codigo: "101",
    nombre: "Inteligencia Artificial",
    programa: "Ingeniería",
    active: true, // true = visible y disponible
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

// ========== OPERACIONES CRUD ==========

/**
 * getElectivesService - Obtener TODAS las electivas
 * @returns Promise<IElective[]> - Lista completa de electivas
 *
 * ¿Por qué devuelve una Promise?
 * - Para simular una llamada a API real (que siempre es asíncrona)
 * - Para mantener consistencia con servicios que sí usan backend
 */
export const getElectivesService = async (): Promise<IElective[]> => {
  // En una app real, aquí habría: await api.get('/electives')
  return electives; // Simplemente devolvemos el array
};

/**
 * createElectiveService - Crear una NUEVA electiva
 * Verifica que no exista otra con el mismo código o nombre (case insensitive)
 * @param elective - Objeto con los datos de la nueva electiva
 * @returns Promise<IElective> - Electiva creada
 * @throws Error si la electiva ya existe activa o inactiva
 */
export const createElectiveService = async (
  elective: IElective
): Promise<IElective> => {
  // 1. BUSCAR SI YA EXISTE UNA ELECTIVA CON EL MISMO CÓDIGO O NOMBRE
  const existing = electives.find(
    (e) =>
      e.codigo === elective.codigo || // Mismo código
      e.nombre.toLowerCase() === elective.nombre.toLowerCase() // Mismo nombre (ignorando mayúsculas)
  );

  // 2. MANEJAR CASOS DE ELECTIVA EXISTENTE
  if (existing) {
    if (!existing.active) {
      // Caso: Existe pero está INACTIVA - Podría reactivarse
      const error: any = new Error("EXISTS_INACTIVE");
      error.existing = existing; // Incluimos la electiva existente en el error
      throw error; // Lanzamos error específico
    }

    // Caso: Ya existe y está ACTIVA - No permitir duplicados
    const error: any = new Error("EXISTS_ACTIVE");
    error.existing = existing;
    throw error;
  }

  // 3. SI NO EXISTE, AGREGAR A LA LISTA
  electives.push(elective);
  return elective; // Devolver la electiva recién creada
};

/**
 * updateElectiveService - Actualizar una electiva existente
 * @param codigo - Código único de la electiva a actualizar
 * @param updated - Objeto con los nuevos datos
 * @returns Promise<IElective> - Electiva actualizada
 * @throws Error si no se encuentra la electiva
 */
export const updateElectiveService = async (
  codigo: string,
  updated: IElective
): Promise<IElective> => {
  // 1. BUSCAR EL ÍNDICE DE LA ELECTIVA EN EL ARRAY
  const index = electives.findIndex((e) => e.codigo === codigo);

  // 2. VERIFICAR SI EXISTE
  if (index === -1) throw new Error("NOT_FOUND"); // No existe la electiva

  // 3. ACTUALIZAR LOS DATOS MANTENIENDO EL ESTADO ACTIVO
  electives[index] = {
    ...updated, // Copiar todas las propiedades nuevas
    active: true, // Asegurar que quede activa después de actualizar
  };

  return electives[index]; // Devolver la versión actualizada
};

/**
 * deleteElectiveService - "Eliminar" una electiva (soft delete)
 * No se borra de la lista, solo se marca como inactiva
 * Esto permite recuperarla después (reactivación)
 * @param codigo - Código de la electiva a eliminar
 * @returns Promise<IElective> - Electiva desactivada
 * @throws Error si no se encuentra la electiva
 */
export const deleteElectiveService = async (
  codigo: string
): Promise<IElective> => {
  const index = electives.findIndex((e) => e.codigo === codigo);
  if (index === -1) throw new Error("NOT_FOUND");

  // SOFT DELETE: Solo cambiar active a false, no remover del array
  electives[index].active = false;
  return electives[index]; // Devolver la electiva desactivada
};

/**
 * reactivateElectiveService - Reactivar una electiva previamente desactivada
 * @param codigo - Código de la electiva a reactivar
 * @returns Promise<IElective> - Electiva reactivada
 * @throws Error si no se encuentra la electiva
 */
export const reactivateElectiveService = async (
  codigo: string
): Promise<IElective> => {
  const index = electives.findIndex((e) => e.codigo === codigo);
  if (index === -1) throw new Error("NOT_FOUND");

  // Cambiar de inactive a active
  electives[index].active = true;
  return electives[index];
};
