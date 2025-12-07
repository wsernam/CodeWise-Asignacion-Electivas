import apiClient from "../Auth/apiClient";
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

    // La respuesta ahora incluye ofe_codigo y otros campos
    const ofertas = response.data.map((oferta: any) => ({
      ofe_codigo: oferta.ofe_codigo, // Ahora guarda el código
      ele_codigo: oferta.ele_codigo,
      ele_nombre: oferta.ele_nombre,
      // También se puede guardar otros campos si se necesita
      pro_codigo: oferta.pro_codigo,
      ofe_anio: oferta.ofe_anio,
      ofe_num_semestre: oferta.ofe_num_semestre,
    }));

    return ofertas;
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
/**
 * ELIMINAR UNA OFERTA POR SU CÓDIGO
 * Endpoint: DELETE /api/ofertas/{ofe_codigo}/
 * @param ofe_codigo - Código de la oferta a eliminar
 * @returns Datos de la oferta eliminada
 */
export const deleteOffer = async (ofe_codigo: number): Promise<any> => {
  console.log(`[offerService] Eliminando oferta: ${ofe_codigo}`);

  try {
    const response = await apiClient.delete(
      `${OFFER_URL_PRIVATE}ofertas/${ofe_codigo}/`
    );

    console.log("[offerService] Oferta eliminada exitosamente");
    return response.data;
  } catch (error: any) {
    console.log(
      "[offerService] Error eliminando oferta:",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar la oferta"
    );
  }
};
