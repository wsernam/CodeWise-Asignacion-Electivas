import { create } from "zustand";
import type { IElective } from "../models/elective";
import {
  getElectivesService,
  createElectiveService,
  updateElectiveService,
  deleteElectiveService,
  reactivateElectiveService,
} from "../services/electiveService";

interface ElectiveState {
  electives: IElective[];
  fetchElectives: () => Promise<void>;
  addElective: (elective: IElective) => Promise<void>;
  updateElective: (codigo: string, updated: IElective) => Promise<void>;
  deleteElective: (codigo: string) => Promise<void>;
  reactivateElective: (codigo: string) => Promise<void>;
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
          ...state.electives.filter((e) => e.codigo !== newElective.codigo),
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
        e.codigo === codigo ? updatedElective : e
      ),
    }));
  },

  deleteElective: async (codigo) => {
    console.log(`[ElectiveStore] Desactivando electiva ${codigo}`);
    const deleted = await deleteElectiveService(codigo);
    console.log("[ElectiveStore] Electiva desactivada OK");
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? deleted : e
      ),
    }));
  },

  reactivateElective: async (codigo) => {
    console.log(`[ElectiveStore] Reactivando electiva ${codigo}`);
    const reactivated = await reactivateElectiveService(codigo);
    console.log("[ElectiveStore] Electiva reactivada OK");
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? reactivated : e
      ),
    }));
  },
}));
