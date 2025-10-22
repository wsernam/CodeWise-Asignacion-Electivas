import { create } from "zustand";
import type { IOffer } from "../Models/offer";
import { createBulkOffer, getOffersByProgram } from "../services/offerService";

interface OfferState {
  loading: boolean;
  error: string | null;

  createBulkOffer: (offerData: IOffer) => Promise<any>;
  getOffersByProgram: (programCode: string, year: number, semester: number) => Promise<any>;
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

  getOffersByProgram: async (programCode: string, year: number, semester: number): Promise<any> => {
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
}));
