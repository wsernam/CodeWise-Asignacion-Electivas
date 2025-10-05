import type { IProgram as Program } from "../models/program";

// ========== CONFIGURACIÓN ==========
/*
 * SWITCH ENTRE MOCK Y BACKEND REAL
 * USE_BACKEND: false = usar datos de prueba (desarrollo)
 * USE_BACKEND: true = conectar con backend real (producción)
 */
const USE_BACKEND = false;
const API_BASE_URL = "http://localhost:3001/api";

// ========== DATOS MOCK (DE PRUEBA) ==========

let programs: Program[] = [
  {
    codigo: "01",
    nombre: "Ingeniería de Sistemas",
    facultad: "Facultad de Ingeniería Electrónica y de Telecomunicaciones",
    active: true, // true = activo, false = eliminado
  },
  {
    codigo: "02",
    nombre: "Ingeniería Electrónica",
    facultad: "Facultad de Ingeniería Electrónica y de Telecomunicaciones",
    active: true,
  },
  {
    codigo: "03",
    nombre: "Ingeniería de Telecomunicaciones",
    facultad: "Facultad de Ingeniería Electrónica y de Telecomunicaciones",
    active: true,
  },
];

// ========== FUNCIONES DEL SERVICIO ==========

/**
 * getPrograms - Obtener TODOS los programas
 * @returns Promise<Program[]> - Lista de programas (siempre async)
 */
export const getPrograms = async (): Promise<Program[]> => {
  // 1. Verificar si debemos usar backend real
  if (USE_BACKEND) {
    try {
      // CÓDIGO PARA BACKEND REAL:
      // const response = await axios.get(`${API_BASE_URL}/programs`);
      // return response.data;
      // Simular delay de red (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Por ahora lanzar error porque el backend no está implementado
      throw new Error("Backend not implemented yet");
    } catch (error) {
      // Si el backend falla, usar datos mock como respaldo
      console.warn("Backend no disponible, usando datos mock");
      return [...programs]; // Devolver copia del array
    }
  }

  // 2. MODO MOCK: Simular delay de red (300ms)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Devolver copia del array para no modificar el original
  return [...programs];
};

/**
 * createProgram - Crear un NUEVO programa
 * @param program - Datos del nuevo programa
 * @returns Promise<Program> - Programa creado
 * @throws Error si el programa ya existe
 */
export const createProgram = async (program: Program): Promise<Program> => {
  // 1. Verificar backend real
  if (USE_BACKEND) {
    try {
      // CÓDIGO PARA BACKEND REAL:
      // const response = await axios.post(`${API_BASE_URL}/programs`, program);
      // return response.data;

      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error("Backend not implemented yet");
    } catch (error) {
      console.warn("Backend no disponible, creando localmente");
    }
  }

  // 2. Simular delay de red (400ms)
  await new Promise((resolve) => setTimeout(resolve, 400));

  // 3. VERIFICAR SI EL PROGRAMA YA EXISTE
  const existingProgram = programs.find(
    (p) =>
      // Mismo código O mismo nombre (case insensitive)
      p.codigo === program.codigo ||
      p.nombre.toLowerCase() === program.nombre.toLowerCase()
  );

  // 4. MANEJAR CASOS DE PROGRAMA EXISTENTE
  if (existingProgram) {
    if (!existingProgram.active) {
      // Caso: Existe pero está inactivo (puede reactivarse)
      const error: any = new Error("EXISTS_INACTIVE");
      error.existing = existingProgram; // Enviar el programa existente
      throw error;
    }

    // Caso: Ya existe y está activo
    const error: any = new Error("EXISTS_ACTIVE");
    error.existing = existingProgram;
    throw error;
  }

  // 5. CREAR NUEVO PROGRAMA
  const newProgram: Program = {
    ...program, // Copiar todas las propiedades
    active: true, // Siempre activo al crear
  };

  // 6. AGREGAR A LA "BASE DE DATOS"
  programs.push(newProgram);
  return newProgram;
};

/**
 * updateProgram - Actualizar un programa existente
 * @param program - Programa con datos actualizados
 * @returns Promise<Program> - Programa actualizado
 * @throws Error si no se encuentra o el nombre ya existe
 */
export const updateProgram = async (program: Program): Promise<Program> => {
  if (USE_BACKEND) {
    try {
      // CÓDIGO BACKEND:
      // const response = await axios.put(`${API_BASE_URL}/programs/${program.codigo}`, program);
      // return response.data;

      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error("Backend not implemented yet");
    } catch (error) {
      console.warn("Backend no disponible, actualizando localmente");
    }
  }

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 400));

  // 1. BUSCAR EL ÍNDICE DEL PROGRAMA
  const index = programs.findIndex((p) => p.codigo === program.codigo);
  if (index === -1) {
    throw new Error("NOT_FOUND"); // Programa no encontrado
  }

  // 2. VERIFICAR SI EL NUEVO NOMBRE YA EXISTE EN OTRO PROGRAMA
  const existingProgram = programs.find(
    (p) =>
      p.nombre.toLowerCase() === program.nombre.toLowerCase() &&
      p.codigo !== program.codigo && // No comparar con sí mismo
      p.active // Solo verificar programas activos
  );

  if (existingProgram) {
    const error: any = new Error("NAME_EXISTS");
    error.existing = existingProgram;
    throw error;
  }

  // 3. ACTUALIZAR EL PROGRAMA
  const updatedProgram = {
    ...program,
    active: true, // Mantener activo
  };

  programs[index] = updatedProgram;
  return updatedProgram;
};

/**
 * getProgramByCode - Obtener un programa por su código único
 * @param codigo - Código del programa a buscar
 * @returns Promise<Program | null> - Programa encontrado o null
 */
export const getProgramByCode = async (
  codigo: string
): Promise<Program | null> => {
  if (USE_BACKEND) {
    try {
      // CÓDIGO BACKEND:
      // const response = await axios.get(`${API_BASE_URL}/programs/${codigo}`);
      // return response.data;

      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new Error("Backend not implemented yet");
    } catch (error) {
      console.warn("Backend no disponible, buscando localmente");
    }
  }

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Buscar programa por código y que esté activo
  const program = programs.find((p) => p.codigo === codigo && p.active);
  return program || null; // Si no encuentra, devolver null
};

/**
 * searchPrograms - Buscar programas por texto
 * @param searchTerm - Texto a buscar en nombre, código o facultad
 * @returns Promise<Program[]> - Programas que coinciden
 */
export const searchPrograms = async (
  searchTerm: string
): Promise<Program[]> => {
  if (USE_BACKEND) {
    try {
      // CÓDIGO BACKEND:
      // const response = await axios.get(`${API_BASE_URL}/programs/search?q=${encodeURIComponent(searchTerm)}`);
      // return response.data;

      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new Error("Backend not implemented yet");
    } catch (error) {
      console.warn("Backend no disponible, buscando localmente");
    }
  }

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 200));

  const lowercaseSearch = searchTerm.toLowerCase();

  // Filtrar programas que:
  return programs.filter(
    (p) =>
      p.active && // 1. Estén activos
      // 2. Coincidan en nombre, código o facultad (case insensitive)
      (p.nombre.toLowerCase().includes(lowercaseSearch) ||
        p.codigo.toLowerCase().includes(lowercaseSearch) ||
        p.facultad.toLowerCase().includes(lowercaseSearch))
  );
};

/**
 * getProgramStats - Obtener estadísticas de programas
 * @returns Promise con total, activos y conteo por facultad
 */
export const getProgramStats = async () => {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Calcular estadísticas
  const total = programs.length;
  const active = programs.filter((p) => p.active).length;

  // Contar programas por facultad usando reduce
  const byFaculty = programs
    .filter((p) => p.active)
    .reduce((acc, program) => {
      // Incrementar el contador para esta facultad
      acc[program.facultad] = (acc[program.facultad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>); // Tipo: objeto con strings como keys y numbers como values

  return { total, active, byFaculty };
};
