import { create } from "zustand";
import {
  changeFormStatus as changeFormStatusService,
  getFormStatus,
} from "../../services/Form/formStatusService";

interface FormStatusState {
  formStatus: boolean;
  loading: boolean;
  error: string | null;
  changeFormStatus: (status: boolean) => Promise<void>;
  fetchFormStatus: () => Promise<void>;
  clearError: () => void;
}

export const useFormStatusStore = create<FormStatusState>((set) => ({
  formStatus: false,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  changeFormStatus: async (status: boolean): Promise<void> => {
    console.log("[formStatusStore] Cambiando estado del formulario a:", status);
    set({ loading: true, error: null });

    try {
      await changeFormStatusService(status);
      set({ loading: false, formStatus: status });
      console.log(
        "[formStatusStore] Estado del formulario cambiado exitosamente"
      );
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al cambiar el estado del formulario",
      });
      throw error;
    }
  },

  fetchFormStatus: async (): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const status = await getFormStatus();
      set({ formStatus: status, loading: false });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al obtener el estado del formulario",
      });
      throw error;
    }
  },
}));
