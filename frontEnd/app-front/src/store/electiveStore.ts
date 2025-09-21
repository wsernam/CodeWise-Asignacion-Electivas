// Zustand: librería para manejar estado global en React
import { create } from "zustand";
import type { IElective } from "../Models/elective";

// Importamos los servicios que interactúan con la "base de datos" en memoria
import {
  getElectivesService,
  createElectiveService,
  updateElectiveService,
  deleteElectiveService,
  reactivateElectiveService,
} from "../services/electiveService";

/**
 * Interfaz que define el estado y las funciones de la store de electivas
 */
interface ElectiveState {
  electives: IElective[]; // Lista de todas las electivas en el estado
  fetchElectives: () => Promise<void>; // Cargar todas las electivas desde el servicio
  addElective: (elective: IElective) => Promise<void>; // Agregar una nueva electiva
  updateElective: (codigo: string, updated: IElective) => Promise<void>; // Actualizar electiva existente
  deleteElective: (codigo: string) => Promise<void>; // Desactivar (eliminar) electiva
  reactivateElective: (codigo: string) => Promise<void>; // Reactivar electiva desactivada
}

/**
 * useElectiveStore: store global para manejar electivas
 * Utiliza Zustand para mantener y actualizar el estado de forma reactiva
 */
export const useElectiveStore = create<ElectiveState>((set) => ({
  electives: [], // Estado inicial vacío

  /**
   * fetchElectives: obtiene todas las electivas del servicio y actualiza la store
   */
  fetchElectives: async () => {
    const data = await getElectivesService();
    console.log("[Store] FetchElectives:", data);
    set({ electives: [...data] }); // Actualizamos el estado con los datos obtenidos
  },

  /**
   * addElective: agrega una nueva electiva
   * Maneja errores si la electiva ya existe activa o inactiva
   */
  addElective: async (elective) => {
    try {
      const newElective = await createElectiveService(elective);
      console.log("[Store] Electiva agregada:", newElective);

      // Actualizamos el estado: reemplazamos cualquier electiva con el mismo código
      set((state) => ({
        electives: [
          ...state.electives.filter((e) => e.codigo !== newElective.codigo),
          newElective,
        ],
      }));
    } catch (err: any) {
      console.error("[Store] Error al agregar:", err);

      // Caso: electiva existe pero está inactiva → reenviamos objeto existente
      if (err.message === "EXISTS_INACTIVE" && err.existing) {
        throw { message: "EXISTS_INACTIVE", existing: err.existing };
      }

      // Caso: electiva ya existe activa → reenviamos objeto existente
      if (err.message === "EXISTS_ACTIVE" && err.existing) {
        throw { message: "EXISTS_ACTIVE", existing: err.existing };
      }

      // Otros errores
      throw err;
    }
  },

  /**
   * updateElective: actualiza los datos de una electiva existente
   * Reemplaza la electiva en el estado con la versión actualizada
   */
  updateElective: async (codigo, updated) => {
    const updatedElective = await updateElectiveService(codigo, updated);
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? updatedElective : e
      ),
    }));
  },

  /**
   * deleteElective: desactiva (elimina) una electiva
   * No la borra del estado, solo marca `active = false`
   */
  deleteElective: async (codigo) => {
    const deleted = await deleteElectiveService(codigo);
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? deleted : e
      ),
    }));
  },

  /**
   * reactivateElective: reactiva una electiva previamente desactivada
   */
  reactivateElective: async (codigo) => {
    const reactivated = await reactivateElectiveService(codigo);
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? reactivated : e
      ),
    }));
  },
}));
