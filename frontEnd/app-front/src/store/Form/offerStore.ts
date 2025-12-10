import { create } from "zustand";
import type { IOffer, IOfferForm } from "../../models/Form/offer";
import {
  createBulkOffer,
  getOffersByProgram,
  deleteOffer,
  getLastOffersPeriod,
  getElectivesAmountByProgram,
} from "../../services/Form/offerService";

interface OfferState {
  loading: boolean;
  error: string | null;
  createBulkOffer: (offerData: IOffer) => Promise<any>;
  deleteOffer: (ofe_codigo: number) => Promise<any>;
  getOffersByProgram: (
    programCode: string,
    year: number,
    semester: number
  ) => Promise<any>;
  getLastOffersPeriod: () => Promise< { ofe_anio: number; ofe_num_semestre: number } >;
  clearError: () => void;
}

export const useOfferStore = create<OfferState>((set) => ({
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  createBulkOffer: async (offerData: IOffer): Promise<any> => {
    set({ loading: true, error: null });

    try {
      const result = await createBulkOffer(offerData);
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al crear las ofertas",
      });
      throw error;
    }
  },

  getOffersByProgram: async (
    programCode: string,
    year: number,
    semester: number
  ): Promise<any> => {
    set({ loading: true, error: null });
    try {
      const result = await getOffersByProgram(programCode, year, semester);
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al obtener las ofertas",
      });
      throw error;
    }
  },

  getElectivesAmountByProgram: async (
    programCode: string,
    year: number,
    semester: number
  ): Promise<IOfferForm> => {
    set({ loading: true, error: null });
    try {
      const result = await getElectivesAmountByProgram(programCode, year, semester);
      console.log(
      "[offerStore] cantidad de electivas para el formulario exitosamente: ",
      result
    );
      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al obtener la cantidad de electivas",
      });
      throw error;
    }
  },

  getLastOffersPeriod: async (): Promise<{ ofe_anio: number; ofe_num_semestre: number }> => {
    set({ loading: true, error: null });
    try {
      const result = await getLastOffersPeriod();
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al obtener el último período de ofertas",
      });
      throw error;
    }
  },

  deleteOffer: async (ofe_codigo: number): Promise<any> => {
    set({ loading: true, error: null });

    try {
      const result = await deleteOffer(ofe_codigo);
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Error al eliminar la oferta",
      });
      throw error;
    }
  },
}));
