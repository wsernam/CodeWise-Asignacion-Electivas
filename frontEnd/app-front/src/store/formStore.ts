import { create } from 'zustand';
import type { FormModel } from '../models/formModel';
import { getForms, activateForm, deactivateForm, createForm } from '../services/formService';

interface FormState {
    forms: FormModel[];
    fetchForms: () => Promise<void>;
    activateAndSetForm: (codigo: number) => Promise<void>;
    deactivateAndUnsetForm: (codigo: number) => Promise<void>;
    createAndAddForm: (form: FormModel) => Promise<void>;
}

export const useFormStore = create<FormState>((set) => ({
    forms: [],

    fetchForms: async () => {
        const data = await getForms();
        set({ forms: data });
    },

    createAndAddForm: async (form) => {
        const created = await createForm(form);
        set((state) => ({ forms: [...state.forms, created] }));
    },

    activateAndSetForm: async (codigo) => {
        await activateForm(codigo);
        set((state) => ({
            forms: state.forms.map(f => f.for_codigo === codigo ? { ...f, for_estado: true } : f)
        }));
    },

    deactivateAndUnsetForm: async (codigo) => {
        await deactivateForm(codigo);
        set((state) => ({
            forms: state.forms.map(f => f.for_codigo === codigo ? { ...f, for_estado: false } : f)
        }));
    }
}));

