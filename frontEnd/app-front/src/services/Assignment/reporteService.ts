import { REPORTS_BASE_URL } from "../config/config";

async function fetchPdf(url: string): Promise<Blob> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    // si vino error JSON desde DRF, lo mostramos
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      const msg = j.detail || JSON.stringify(j);
      throw new Error(`${res.status} ${res.statusText} – ${msg}`);
    }
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return await res.blob();
}

export const reporteService = {
  getGeneralBlob(anio: number, semestre: number) {
    return fetchPdf(`${REPORTS_BASE_URL}/asignacion-general/?anio=${anio}&semestre=${semestre}`);
  },
  getElectivaBlob(eleCodigo: string, anio: number, semestre: number) {
    return fetchPdf(`${REPORTS_BASE_URL}/electiva/${encodeURIComponent(eleCodigo)}/?anio=${anio}&semestre=${semestre}`);
  },
  getEstudianteBlob(estId: string | number, anio: number, semestre: number) {
    return fetchPdf(`${REPORTS_BASE_URL}/estudiante/${estId}/?anio=${anio}&semestre=${semestre}`);
  },
};
