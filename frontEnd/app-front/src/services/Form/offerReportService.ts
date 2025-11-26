import apiClient from "../apiClient";
import { OFFER_REPORT_URL_PRIVATE } from "../config/config";

async function fetchPdf(url: string): Promise<Blob> {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob', // Importante: le dice a Axios que espere un Blob
    });
    
    return response.data as Blob;
  } catch (error: any) {
    console.error("[offerReportService] Error obteniendo PDF:", error);
    
    // Manejo de errores de Axios
    if (error.response) {
      const contentType = error.response.headers['content-type'] || '';
      
      // Si el backend devolvió JSON con el error (en lugar de PDF)
      if (contentType.includes('application/json')) {
        const errorData = error.response.data;
        const msg = errorData.detail || JSON.stringify(errorData);
        throw new Error(`${error.response.status} ${error.response.statusText} – ${msg}`);
      }
      
      throw new Error(`${error.response.status} ${error.response.statusText}`);
    }
    
    throw error;
  }
}

export const offerReportService = {
  getElectiveOfferReport(year: number, semester: number): Promise<Blob> {
    return fetchPdf(`${OFFER_REPORT_URL_PRIVATE}/${year}/${semester}/`);
  },
};