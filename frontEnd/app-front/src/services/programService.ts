import type { IProgram as Program } from "../models/program";
import { PROGRAMS_URL } from "./config/config";

// ========== FUNCIONES DE CONEXIÓN CON BACKEND ==========

/**
 * Obtiene todos los programas activos desde el backend
 * @returns Promise<Program[]> - Lista de programas
 */
export const getPrograms = async (): Promise<Program[]> => {
  try {
    console.log("[programService] Conectando a:", `${PROGRAMS_URL}/`);

    const response = await fetch(`${PROGRAMS_URL}/`);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Obtener datos crudos del backend
    const backendData = await response.json();
    console.log("[programService] Datos CRUDOS del backend:", backendData);

    // Transformar datos al formato de nuestra interfaz Program
    const transformedData: Program[] = backendData.map((item: any) => ({
      pro_codigo: item.pro_codigo,
      pro_nombre: item.pro_nombre,
      fac_codigo: item.fac_codigo,
      fac_nombre: item.fac_nombre,
      pro_activo: item.pro_activo,
    }));

    console.log("[programService] Datos transformados:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("[programService] Error obteniendo programas:", error);
    throw new Error("No se pudieron cargar los programas");
  }
};

/**
 * Crea un nuevo programa en el backend
 * @param program - Datos del programa a crear
 * @returns Promise<Program> - Programa creado
 */
export const createProgram = async (program: Program): Promise<Program> => {
  try {
    console.log("[programService] Creando programa:", program);

    const response = await fetch(`${PROGRAMS_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(program), // Envía fac_codigo al backend
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const createdProgram = await response.json();
    console.log("[programService] Programa creado:", createdProgram);
    return createdProgram;
  } catch (error) {
    console.error("[programService] Error creando programa:", error);
    throw error;
  }
};

/**
 * Actualiza un programa existente en el backend
 * @param program - Datos actualizados del programa
 * @returns Promise<Program> - Programa actualizado
 */
export const updateProgram = async (program: Program): Promise<Program> => {
  try {
    console.log("[programService] Actualizando programa:", program);
    console.log(
      "[programService] JSON que se enviará:",
      JSON.stringify(program)
    );

    const response = await fetch(`${PROGRAMS_URL}/${program.pro_codigo}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(program), // Envía fac_codigo al backend
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const updatedProgram = await response.json();
    console.log("[programService] Programa actualizado:", updatedProgram);
    return updatedProgram;
  } catch (error) {
    console.error("[programService] Error actualizando programa:", error);
    throw error;
  }
};

/**
 * Obtiene un programa específico por su código
 * @param codigo - Código del programa a buscar
 * @returns Promise<Program | null> - Programa encontrado o null si no existe
 */
export const getProgramByCode = async (
  codigo: number
): Promise<Program | null> => {
  try {
    console.log(`[programService] Buscando programa: ${codigo}`);

    const response = await fetch(`${PROGRAMS_URL}/${codigo}/`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error: ${response.statusText}`);
    }

    const program: Program = await response.json();
    return program;
  } catch (error) {
    console.error("[programService] Error buscando programa:", error);
    throw error;
  }
};

// ========== FUNCIONES QUE REQUIEREN IMPLEMENTACIÓN EN BACKEND ==========

/**
 * Busca programas por término de búsqueda
 * NOTA: Esta función necesita implementación en el backend
 * @param searchTerm - Término de búsqueda
 * @returns Promise<Program[]> - Programas que coinciden con la búsqueda
 */
export const searchPrograms = async (
  searchTerm: string
): Promise<Program[]> => {
  try {
    console.log(`[programService] Buscando: "${searchTerm}"`);

    // TODO: Implementar endpoint de búsqueda en backend
    // Por ahora usamos filtrado client-side como temporal
    const allPrograms = await getPrograms();
    const lowercaseSearch = searchTerm.toLowerCase();

    return allPrograms.filter(
      (p) =>
        p.pro_activo &&
        (p.pro_nombre.toLowerCase().includes(lowercaseSearch) ||
          p.pro_codigo.toString().includes(lowercaseSearch) ||
          p.fac_nombre.toLowerCase().includes(lowercaseSearch))
    );
  } catch (error) {
    console.error("[programService] Error buscando programas:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de programas
 * NOTA: Esta función necesita implementación en el backend
 * @returns Promise<{total: number, active: number, byFaculty: Record<string, number>}>
 */
export const getProgramStats = async () => {
  try {
    console.log("[programService] Obteniendo estadísticas");

    // TODO: Implementar endpoint de estadísticas en backend
    // Por ahora calculamos client-side como temporal
    const allPrograms = await getPrograms();
    const total = allPrograms.length;
    const active = allPrograms.filter((p) => p.pro_activo).length;
    const byFaculty = allPrograms
      .filter((p) => p.pro_activo)
      .reduce((acc, program) => {
        acc[program.fac_nombre] = (acc[program.fac_nombre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return { total, active, byFaculty };
  } catch (error) {
    console.error("[programService] Error obteniendo estadísticas:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de facultades desde los programas existentes
 * @returns Promise<Array<{fac_codigo: number, fac_nombre: string}>>
 */
export const getFacultiesFromPrograms = async (): Promise<
  Array<{ fac_codigo: number; fac_nombre: string }>
> => {
  try {
    console.log("[programService] Obteniendo facultades desde programas...");

    const allPrograms = await getPrograms();

    // Extraer facultades únicas de los programas
    const uniqueFaculties = allPrograms.reduce((acc, program) => {
      const existing = acc.find((f) => f.fac_codigo === program.fac_codigo);
      if (!existing) {
        acc.push({
          fac_codigo: program.fac_codigo,
          fac_nombre: program.fac_nombre,
        });
      }
      return acc;
    }, [] as Array<{ fac_codigo: number; fac_nombre: string }>);

    console.log("[programService] Facultades obtenidas:", uniqueFaculties);
    return uniqueFaculties;
  } catch (error) {
    console.error("[programService] Error obteniendo facultades:", error);
    throw error;
  }
};
