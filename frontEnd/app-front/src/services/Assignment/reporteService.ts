import apiClient from "../apiClient";
import { REPORTS_ASIGNACION_BASE_URL_PRIVATE } from "../config/config";

async function fetchPdf(url: string): Promise<Blob> {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob', // Importante: le dice a Axios que espere un Blob
    });
    
    return response.data as Blob;
  } catch (error: any) {
    console.error("[reporteService] Error obteniendo PDF:", error);
    
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

export const reporteService = {
  getListasBlob(anio: number, semestre: number) {
    return fetchPdf(
      `${REPORTS_ASIGNACION_BASE_URL_PRIVATE}/asignacion-general/?anio=${anio}&semestre=${semestre}`
    );
  },
  
  getElectivaBlob(eleCodigo: string, anio: number, semestre: number) {
    return fetchPdf(
      `${REPORTS_ASIGNACION_BASE_URL_PRIVATE}/electiva/${encodeURIComponent(eleCodigo)}/?anio=${anio}&semestre=${semestre}`
    );
  },
  
  getEstudianteBlob(estId: string | number, anio: number, semestre: number) {
    return fetchPdf(
      `${REPORTS_ASIGNACION_BASE_URL_PRIVATE}/estudiante/${estId}/?anio=${anio}&semestre=${semestre}`
    );
  },
  
  getGeneralBlob(anio: number, semestre: number) {
    return fetchPdf(
      `${REPORTS_ASIGNACION_BASE_URL_PRIVATE}/reporte-asignacion-general/?anio=${anio}&semestre=${semestre}`
    );
  },
};