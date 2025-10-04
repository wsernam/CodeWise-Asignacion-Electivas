import { create } from "zustand";
import type { FormAdmin } from "../Models/formAdmin";
import {
  offerElectives,
  changeFormStatus
} from "../services/formAdminService";

interface FormState {
  forms: FormAdmin[];
  offerElectives: () => Promise<void>;
  changeFormStatus: (form: FormAdmin) => Promise<void>;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],

  offerElectives: async () => {
    await offerElectives();
  },

  changeFormStatus: async (form: FormAdmin) => {
    await changeFormStatus(form);
    // Aquí podrías actualizar el estado si es necesario
  }
}));
