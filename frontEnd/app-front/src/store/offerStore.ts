import { create } from "zustand";
import type { IOffer } from "../models/offer";
import {
  offerElectives,
  changeFormStatus as changeFormStatusService,
  saveOfferAndManageForm,
} from "../services/offerService";
import { useProgramStore } from "../store/programStore";

interface FormState {
  forms: IOffer[];
  currentForm: IOffer | null;
  loading: boolean;
  error: string | null;

  // Estado global del formulario (coincide con modelos de estado)
  formStatus: boolean;

  // Ofrece electivas con la configuración actual
  offerElectives: (
    formData: IOffer
  ) => Promise<{ created: number; updated: number; skipped: number }>;

  // Cambia el estado del formulario (recibe boolean)
  changeFormStatus: (status: boolean) => Promise<void>;

  // Función combinada: guardar ofertas y opcionalmente cambiar estado del formulario
  saveOfferAndManageForm: (
    formData: IOffer,
    shouldChangeForm?: boolean,
    newFormStatus?: boolean
  ) => Promise<{
    offerResult: { created: number; updated: number; skipped: number };
    formChanged: boolean;
  }>;

  setCurrentForm: (form: IOffer) => void;
  clearError: () => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  currentForm: null,
  loading: false,
  error: null,

  // Estado del formulario (por defecto false)
  formStatus: false,

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

  // Cambia el estado del formulario
  changeFormStatus: async (status: boolean): Promise<void> => {
    console.log("[offerStore] Cambiando estado del formulario a:", status);
    set({ loading: true, error: null });

    try {
      // usar alias para evitar confusiones con el nombre
      await changeFormStatusService(status);

      // actualizar estado global del formulario en el store
      set({ loading: false, formStatus: status });
      console.log("[offerStore] Estado del formulario cambiado exitosamente");
    } catch (error: any) {
      console.error(
        "[offerStore] Error cambiando estado del formulario:",
        error
      );
      set({
        loading: false,
        error: error.message || "Error al cambiar el estado del formulario",
      });
      throw error;
    }
  },

  // Función combinada: guardar ofertas y opcionalmente cambiar estado del formulario
  saveOfferAndManageForm: async (
    formData: IOffer,
    shouldChangeForm: boolean = false,
    newFormStatus?: boolean
  ): Promise<{
    offerResult: { created: number; updated: number; skipped: number };
    formChanged: boolean;
  }> => {
    // ...existing code...
    console.log("[offerStore] Iniciando proceso completo:", {
      formData,
      shouldChangeForm,
      newFormStatus,
    });

    set({ loading: true, error: null });

    try {
      const programs = useProgramStore.getState().programs;
      if (programs.length === 0) {
        throw new Error(
          "No hay programas disponibles. Carga los programas primero."
        );
      }

      const result = await saveOfferAndManageForm(
        formData,
        programs,
        shouldChangeForm,
        newFormStatus
      );

      // Si se pidió cambiar el estado del formulario, reflejarlo en el store
      if (shouldChangeForm && typeof newFormStatus === "boolean") {
        set({ formStatus: newFormStatus });
      }

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
