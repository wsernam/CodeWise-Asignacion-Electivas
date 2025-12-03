import { OFFER_REPORT_URL } from "../config/config";

async function fetchPdf(url: string): Promise<Blob> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
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

export const offerReportService = {
  getElectiveOfferReport(year: number, semester: number): Promise<Blob> {
    return fetchPdf(`${OFFER_REPORT_URL}/${year}/${semester}/`);
  },
};
