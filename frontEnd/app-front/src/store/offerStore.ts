import { create } from "zustand";
import type { IOffer } from "../models/offer";
import { createBulkOffer } from "../services/offerService";

interface OfferState {
  loading: boolean;
  error: string | null;

  createBulkOffers: (offerData: IOffer) => Promise<any>;
  clearError: () => void;
}

export const useOfferStore = create<OfferState>((set) => ({
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  createBulkOffers: async (offerData: IOffer): Promise<any> => {
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
}));
