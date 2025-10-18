import { create } from "zustand";
import type { IOffer } from "../models/offer";
import { offerElectives } from "../services/offerService";
import { useProgramStore } from "../store/programStore";

interface FormState {
  forms: IOffer[];
  currentForm: IOffer | null;
  loading: boolean;
  error: string | null;

  // Ofrece electivas con la configuración actual
  offerElectives: (
    formData: IOffer
  ) => Promise<{ created: number; updated: number; skipped: number }>;

  setCurrentForm: (form: IOffer) => void;
  clearError: () => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  currentForm: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  // Ofrece electivas con la configuración actual
  offerElectives: async (
    formData: IOffer
  ): Promise<{ created: number; updated: number; skipped: number }> => {
    // ...existing code...
    console.log("[offerStore] Iniciando oferta de electivas:", formData);
    set({ loading: true, error: null });

    try {
      const programs = useProgramStore.getState().programs;
      if (programs.length === 0) {
        throw new Error(
          "No hay programas disponibles. Carga los programas primero."
        );
      }

      const result = await offerElectives(formData, programs);

      set({
        currentForm: formData,
        loading: false,
      });

      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al guardar la oferta de electivas",
      });
      throw error;
    }
  },
  setCurrentForm: (form: IOffer) => set({ currentForm: form }),
}));
