import { create } from "zustand";
import type { FormAdmin } from "../models/formAdmin";
import { offerElectives, changeFormStatus } from "../services/formAdminService";

interface FormState {
  forms: FormAdmin[];
  currentForm: FormAdmin | null; // Manejar el formulario actual
  offerElectives: (formData: FormAdmin) => Promise<void>;
  changeFormStatus: (formData: FormAdmin) => Promise<void>;
  setCurrentForm: (form: FormAdmin) => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  currentForm: null,

  // Ofrece electivas con la configuración actual
  offerElectives: async (formData: FormAdmin) => {
    await offerElectives(formData);
    set({ currentForm: formData });
  },

  // Cambia el estado del formulario
  changeFormStatus: async (formData: FormAdmin) => {
    await changeFormStatus(formData);
    set({ currentForm: formData });
  },
  setCurrentForm: (form: FormAdmin) => set({ currentForm: form }),
}));
