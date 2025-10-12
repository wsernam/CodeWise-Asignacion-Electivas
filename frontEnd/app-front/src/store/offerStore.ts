import { create } from "zustand";
import type { IOffer } from "../models/offer";
import {
  offerElectives,
  changeFormStatus,
  saveOfferAndManageForm,
} from "../services/offerService";
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

  // Cambia el estado del formulario
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

  clearError: () => set({ error: null }),

  // Ofrece electivas con la configuración actual
  offerElectives: async (
    formData: IOffer
  ): Promise<{ created: number; updated: number; skipped: number }> => {
    console.log("[offerStore] Iniciando oferta de electivas:", formData);
    set({ loading: true, error: null });

    try {
      // Obtener programas del store de programas
      const programs = useProgramStore.getState().programs;
      console.log("[offerStore] Programas disponibles:", programs.length);

      if (programs.length === 0) {
        throw new Error(
          "No hay programas disponibles. Carga los programas primero."
        );
      }

      // Llamar al servicio con los programas
      const result = await offerElectives(formData, programs);

      // Actualizar el currentForm con los nuevos datos
      set({
        currentForm: formData,
        loading: false,
      });

      console.log("[offerStore] Oferta de electivas completada exitosamente");
      return result;
    } catch (error: any) {
      console.error("[offerStore] Error ofreciendo electivas:", error);
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
      await changeFormStatus(status);

      set({ loading: false });
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
    console.log("[offerStore] Iniciando proceso completo:", {
      formData,
      shouldChangeForm,
      newFormStatus,
    });

    set({ loading: true, error: null });

    try {
      // Obtener programas del store de programas
      const programs = useProgramStore.getState().programs;
      console.log("[offerStore] Programas disponibles:", programs.length);

      if (programs.length === 0) {
        throw new Error(
          "No hay programas disponibles. Carga los programas primero."
        );
      }

      // Llamar al servicio combinado
      const result = await saveOfferAndManageForm(
        formData,
        programs,
        shouldChangeForm,
        newFormStatus
      );

      // Actualizar el currentForm con los nuevos datos
      set({
        currentForm: formData,
        loading: false,
      });

      console.log("[offerStore] Proceso completo completado exitosamente");
      return result;
    } catch (error: any) {
      console.error("[offerStore] Error en proceso completo:", error);
      set({
        loading: false,
        error: error.message || "Error al guardar la oferta de electivas",
      });
      throw error;
    }
  },

  setCurrentForm: (form: IOffer) => set({ currentForm: form }),
}));
