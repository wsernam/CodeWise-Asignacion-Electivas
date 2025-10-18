import axios from "../api/axiosInstance";
import type { IAcademicOffer, IOffer } from "../models/offer";
import { FORM_URL } from "./config/config";

// Función transformadora de IOffer a IAcademicOffer[]
const transformOfferToAcademicOffers = (
  offer: IOffer,
  programs: any[]
): IAcademicOffer[] => {
  const academicOffers: IAcademicOffer[] = [];

  console.log("[offerService] Transformando oferta para backend...");

  Object.entries(offer.electivesByProgram).forEach(
    ([programName, electiveCodes]) => {
      // Buscar el programa por nombre para obtener su código
      const program = programs.find((p) => p.pro_nombre === programName);

      if (!program) {
        console.warn(`[offerService] Programa no encontrado: ${programName}`);
        return;
      }

      electiveCodes.forEach((electiveCode) => {
        academicOffers.push({
          ofe_anio: offer.for_year,
          ofe_num_semestre: offer.for_semester,
          ele_codigo: electiveCode,
          pro_codigo: program.pro_codigo.toString(),
        });
      });
    }
  );

  console.log(
    `[offerService] Transformación completada: ${academicOffers.length} ofertas`
  );
  return academicOffers;
};

export const offerElectives = async (
  offerData: IOffer,
  programs: any[]
): Promise<{ created: number; updated: number; skipped: number }> => {
  console.log("[offerService] Procesando ofertas para el período");

  // Transformar datos para el backend
  const academicOffers = transformOfferToAcademicOffers(offerData, programs);

  if (academicOffers.length === 0) {
    throw new Error("No hay ofertas válidas para guardar");
  }

  console.log(`[offerService] Procesando ${academicOffers.length} ofertas`);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < academicOffers.length; i++) {
    const offer = academicOffers[i];
    console.log(`[offerService] Procesando oferta ${i + 1}:`, offer);

    try {
      // Intentar CREAR la oferta
      const response = await axios.post(`${FORM_URL}/ofertas/`, offer);
      console.log(`Oferta ${i + 1} CREADA:`, response.status);
      createdCount++;
    } catch (error: any) {
      if (error.response?.status === 400) {
        // Oferta duplicada - ya existe para este período
        console.warn(`Oferta ${i + 1} ya existe, omitiendo...`);
        skippedCount++;

        // NOTA: Si se necesita actualizar ofertas existentes, se necesita
        // primero hacer un GET para obtener el ID y luego un PUT
      } else {
        console.error(`Error real:`, error.response?.data);
        throw error;
      }
    }
  }

  console.log(
    `Proceso completado: ${createdCount} nuevas, ${updatedCount} actualizadas, ${skippedCount} ya existían`
  );

  return {
    created: createdCount,
    updated: updatedCount,
    skipped: skippedCount,
  };
};
