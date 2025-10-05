import { create } from "zustand";
import type { IOffer as Offer } from "../models/offer";
import { offerElectives, changeFormStatus } from "../services/offerService";

interface FormState {
  forms: Offer[];
  currentForm: Offer | null; // Manejar el formulario actual
  offerElectives: (formData: Offer) => Promise<void>;
  changeFormStatus: (formData: Offer) => Promise<void>;
  setCurrentForm: (form: Offer) => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  currentForm: null,

  // Ofrece electivas con la configuración actual
  offerElectives: async (formData: Offer) => {
    await offerElectives(formData);
    set({ currentForm: formData });
  },

  // Cambia el estado del formulario
  changeFormStatus: async (formData: Offer) => {
    await changeFormStatus(formData);
    set({ currentForm: formData });
  },
  setCurrentForm: (form: Offer) => set({ currentForm: form }),
}));
