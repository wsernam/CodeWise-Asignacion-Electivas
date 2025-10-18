import axios from "../api/axiosInstance";
import type { IOffer } from "../models/offer";
import { OFFER_URL } from "./config/config";

export const createBulkOffer = async (offerData: IOffer): Promise<any> => {
  console.log("[offerService] Creando ofertas en lote: ", offerData);

  try {
    const response = await axios.post(
      `${OFFER_URL}/ofertas/bulk-create/`,
      offerData
    );

    console.log("[offerService] Ofertas creadas exitosamente");
    return response.data;
  } catch (error: any) {
    console.log("[offerService] Error creando ofertas:", error.response?.data);
    throw error;
  }
};
