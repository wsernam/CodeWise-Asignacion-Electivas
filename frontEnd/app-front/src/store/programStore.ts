import { create } from "zustand";
import type { Program } from "../Models/program";
import {
  getPrograms,
  createProgram,
  deactivateProgram,
  updateProgram,
} from "../services/programService";

interface ProgramState {
  programs: Program[];
  fetchPrograms: () => Promise<void>;
  createAndAddProgram: (program: Program) => Promise<void>;
  updateAndReplaceProgram: (program: Program) => Promise<void>;
  deactivateAndRemoveProgram: (codigo: string) => Promise<void>;
}

export const useProgramStore = create<ProgramState>((set) => ({
  programs: [],

  fetchPrograms: async () => {
    const data = await getPrograms();
    set({ programs: data });
  },

  createAndAddProgram: async (program) => {
    const created = await createProgram(program);
    set((state) => ({ programs: [...state.programs, created] }));
  },

  updateAndReplaceProgram: async (program) => {
    const updated = await updateProgram(program);
    set((state) => ({
      programs: state.programs.map((p) =>
        p.codigo === updated.codigo ? updated : p
      ),
    }));
  },

  deactivateAndRemoveProgram: async (codigo) => {
    await deactivateProgram(codigo);
    set((state) => ({
      programs: state.programs.filter((p) => p.codigo !== codigo),
    }));
  },
}));
