import apiClient from "../apiClient";
import type { IOffer } from "../../models/Form/offer";
import { OFFER_URL_PUBLIC, OFFER_URL_PRIVATE } from "../config/config";

export const createBulkOffer = async (offerData: IOffer): Promise<any> => {
  console.log("[offerService] Creando ofertas en lote: ", offerData);

  try {
    const response = await apiClient.post(
      `${OFFER_URL_PRIVATE}ofertas/bulk-create/`,
      offerData
    );

    console.log("[offerService] Ofertas creadas exitosamente");
    return response.data;
  } catch (error: any) {
    console.log("[offerService] Error creando ofertas:", error.response?.data);
    throw new Error(
      error.response?.data?.detail || 
      error?.message || 
      "No se pudieron crear las ofertas"
    );
  }
};

export const getOffersByProgram = async (
  programCode: string,
  year: number,
  semester: number
): Promise<any> => {
  try {
    const response = await apiClient.get(
      `${OFFER_URL_PUBLIC}ofertas/${year}/${semester}/${programCode}/`
    );
    console.log(
      "[offerService] Ofertas obtenidas exitosamente: ",
      response.data
    );
    console.log(`${OFFER_URL_PUBLIC}ofertas/${year}/${semester}/${programCode}/`)
    return response.data;
  } catch (error: any) {
    console.log(
      "[offerService] Error obteniendo ofertas:",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.detail || 
      error?.message || 
      "No se pudieron obtener las ofertas"
    );
  }
};