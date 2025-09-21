// src/store/electiveStore.ts
import { create } from "zustand";
import type { IElective } from "../Models/elective";
import { ElectiveService } from "../services/electiveService";

interface ElectiveState {
  electives: IElective[];
  loadElectives: () => Promise<void>;
  addElective: (elective: IElective) => Promise<void>;
  updateElective: (codigo: string, updated: IElective) => Promise<void>;
  deleteElective: (codigo: string) => Promise<void>;
}

export const useElectiveStore = create<ElectiveState>((set) => ({
  electives: [],

  loadElectives: async () => {
    const data = await ElectiveService.getAll();
    set({ electives: data });
  },

  addElective: async (elective) => {
    await ElectiveService.add(elective);
    set((state) => ({ electives: [...state.electives, elective] }));
  },

  updateElective: async (codigo, updated) => {
    await ElectiveService.update(codigo, updated);
    set((state) => ({
      electives: state.electives.map((e) =>
        e.codigo === codigo ? updated : e
      ),
    }));
  },

  deleteElective: async (codigo) => {
    await ElectiveService.delete(codigo);
    set((state) => ({
      electives: state.electives.filter((e) => e.codigo !== codigo),
    }));
  },
}));
