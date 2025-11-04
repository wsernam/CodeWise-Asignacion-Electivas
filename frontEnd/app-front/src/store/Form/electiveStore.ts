import { create } from "zustand";
import type { IElective } from "../../models/Form/elective";
import {
  getElectivesService,
  createElectiveService,
  updateElectiveService,
  deleteElectiveService,
  reactivateElectiveService,
} from "../../services/Form/electiveService";

interface ElectiveState {
  electives: IElective[];
  fetchElectives: () => Promise<void>;
  addElective: (elective: IElective) => Promise<void>;
  updateElective: (ele_codigo: string, updated: IElective) => Promise<void>;
  deleteElective: (ele_codigo: string) => Promise<void>;
  reactivateElective: (ele_codigo: string) => Promise<void>;
  getActiveElectivesForProgram: (programa: string) => Promise<IElective[]>;
}

export const useElectiveStore = create<ElectiveState>((set) => ({
  electives: [],

  fetchElectives: async () => {
    console.log("[ElectiveStore] Cargando electivas...");
    const data = await getElectivesService();
    console.log(`[ElectiveStore] ${data.length} electivas cargadas`);
    set({ electives: [...data] });
  },

  addElective: async (elective) => {
    console.log("[ElectiveStore] Agregando electiva:", elective);
    try {
      const newElective = await createElectiveService(elective);
      console.log("[ElectiveStore] Electiva agregada OK");
      set((state) => ({
        electives: [
          ...state.electives.filter(
            (e) => e.ele_codigo !== newElective.ele_codigo
          ),
          newElective,
        ],
      }));
    } catch (err: any) {
      console.log("[ElectiveStore] Error agregando electiva:", err.message);
      throw err;
    }
  },

  updateElective: async (codigo, updated) => {
    console.log(`[ElectiveStore] Actualizando electiva ${codigo}`);
    const updatedElective = await updateElectiveService(codigo, updated);
    console.log("[ElectiveStore] Electiva actualizada OK");
    set((state) => ({
      electives: state.electives.map((e) =>
        e.ele_codigo === codigo ? updatedElective : e
      ),
    }));
  },

  deleteElective: async (codigo) => {
    console.log(`[ElectiveStore] Desactivando electiva ${codigo}`);
    const deleted = await deleteElectiveService(codigo);
    console.log("[ElectiveStore] Electiva desactivada OK");
    set((state) => ({
      electives: state.electives.map((e) =>
        e.ele_codigo === codigo ? deleted : e
      ),
    }));
  },

  reactivateElective: async (codigo) => {
    console.log(`[ElectiveStore] Reactivando electiva ${codigo}`);
    const reactivated = await reactivateElectiveService(codigo);
    console.log("[ElectiveStore] Electiva reactivada OK");
    set((state) => ({
      electives: state.electives.map((e) =>
        e.ele_codigo === codigo ? reactivated : e
      ),
    }));
  },

  getActiveElectivesForProgram: async (
    programa: string
  ): Promise<IElective[]> => {
    try {
      const allElectives = await getElectivesService();
      const activeElectives = allElectives.filter(
        (elective) =>
          elective.ele_estado === true && elective.pro_codigo === programa //Suponiendo que activo se representa con 1
      );
      return activeElectives;
    } catch (error) {
      console.error("Error al obtener electivas activas:", error);
      return [];
    }
  },
}));
