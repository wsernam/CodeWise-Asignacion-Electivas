import { create } from "zustand";
import type { IElective } from "../models/elective";

// Importar los servicios que se comunican con la base de datos
import {
  getElectivesService,
  createElectiveService,
  updateElectiveService,
  deleteElectiveService,
  reactivateElectiveService,
} from "../services/electiveService";

interface ElectiveState {
  electives: IElective[];

  fetchElectives: () => Promise<void>; // Leer todas
  addElective: (elective: IElective) => Promise<void>; // Crear
  updateElective: (codigo: string, updated: IElective) => Promise<void>; // Actualizar
  deleteElective: (codigo: string) => Promise<void>; // Eliminar (soft delete)
  reactivateElective: (codigo: string) => Promise<void>; // Reactivar
}

/**
 * HOOK: useElectiveStore
 * Store global para manejar materias electivas
 */
export const useElectiveStore = create<ElectiveState>((set) => ({
  electives: [],

  // ========== CRUD ==========

  /**
   * fetchElectives - Cargar todas las electivas
   * Se usa cuando la aplicación inicia o cuando necesitamos refrescar los datos
   */
  fetchElectives: async () => {
    // 1. Obtener datos del servicio
    const data = await getElectivesService();
    console.log("[Store] Electivas cargadas:", data);

    // 2. Actualizar el estado con los nuevos datos
    // Usamos spread operator [...] para crear un nuevo array (inmutabilidad)
    set({ electives: [...data] });
  },

  /**
   * addElective - Agregar una nueva electiva
   * Maneja los casos donde la electiva ya existe (activa o inactiva)
   */
  addElective: async (elective) => {
    try {
      // 1. Intentar crear en el servidor
      const newElective = await createElectiveService(elective);
      console.log("[Store] Electiva agregada:", newElective);

      // 2. Actualizar el estado local
      set((state) => ({
        electives: [
          // Filtrar por si ya existe una versión con el mismo código
          ...state.electives.filter((e) => e.codigo !== newElective.codigo),
          newElective, // Agregar la nueva electiva
        ],
      }));
    } catch (err: any) {
      console.error("[Store] Error al agregar:", err);

      // 3. Manejar errores específicos del dominio

      // Caso: Electiva existe pero está inactiva
      if (err.message === "EXISTS_INACTIVE" && err.existing) {
        // Re-lanzar el error con la información de la electiva existente
        throw { message: "EXISTS_INACTIVE", existing: err.existing };
      }

      // Caso: Electiva ya existe y está activa
      if (err.message === "EXISTS_ACTIVE" && err.existing) {
        throw { message: "EXISTS_ACTIVE", existing: err.existing };
      }

      // Cualquier otro error, re-lanzarlo
      throw err;
    }
  },

  /**
   * updateElective - Actualizar una electiva existente
   * Busca por código y reemplaza toda la electiva
   */
  updateElective: async (codigo, updated) => {
    // 1. Actualizar en el servidor
    const updatedElective = await updateElectiveService(codigo, updated);

    // 2. Actualizar en el estado local
    set((state) => ({
      electives: state.electives.map((e) =>
        // Si encontramos la electiva por código, la reemplazamos
        e.codigo === codigo ? updatedElective : e
      ),
    }));
  },

  /**
   * deleteElective - "Eliminar" una electiva (soft delete)
   * IMPORTANTE: No borra realmente, solo marca como inactive
   * Esto se llama "eliminación lógica" y permite recuperar después
   */
  deleteElective: async (codigo) => {
    // 1. Marcar como inactive en el servidor
    const deleted = await deleteElectiveService(codigo);

    // 2. Actualizar el estado local
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? deleted : e
      ),
    }));
  },

  /**
   * reactivateElective - Reactivar una electiva previamente eliminada
   * Cambia el estado de active: false a active: true
   */
  reactivateElective: async (codigo) => {
    // 1. Reactivar en el servidor
    const reactivated = await reactivateElectiveService(codigo);

    // 2. Actualizar el estado local
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? reactivated : e
      ),
    }));
  },
}));
