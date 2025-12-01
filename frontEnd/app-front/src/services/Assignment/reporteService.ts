import apiClient from "../Auth/apiClient";
import { REPORTS_ASIGNACION_BASE_URL_PRIVATE } from "../config/config";
import axios from "axios";

async function fetchPdf(url: string): Promise<Blob> {
  try {
    const response = await apiClient.get(url, {
      responseType: "blob",
    });

    return response.data as Blob;
  } catch (error: any) {
    console.error("[reporteService] Error obteniendo PDF:", error);

    if (axios.isAxiosError(error) && error.response) {
      const { status, statusText, data } = error.response;
      let msg = "No fue posible generar el reporte.";

      // data viene como Blob por responseType:'blob'
      if (data instanceof Blob) {
        const text = await data.text();

        try {
          const json = JSON.parse(text);
          if (json && typeof json === "object" && "detail" in json) {
            msg = json.detail as string;
          } else {
            msg = text;
          }
        } catch {
          msg = text;
        }
      } else if (typeof data === "string") {
        // por si llega como string
        try {
          const json = JSON.parse(data);
          msg = (json as any).detail || data;
        } catch {
          msg = data;
        }
      } else if (typeof data === "object" && data !== null) {
        msg = (data as any).detail || msg;
      }

      // 🔥 Mensaje final para el usuario
      // - Si es 404: mostramos "Error 404 – <detalle>"
      // - Otros códigos: "Error <status> (<statusText>) – <detalle>"
      const userMessage =
        status === 404
          ? `Error 404 – ${msg}`
          : `Error ${status} (${statusText}) – ${msg}`;

      throw new Error(userMessage);
    }

    throw new Error("Error inesperado. Intenta nuevamente.");
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
      `${REPORTS_ASIGNACION_BASE_URL_PRIVATE}/electiva/${encodeURIComponent(
        eleCodigo
      )}/?anio=${anio}&semestre=${semestre}`
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
