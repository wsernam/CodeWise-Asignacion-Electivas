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

// ESTRATEGIA MEJORADA: Verificar existencia y actualizar si es necesario
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

export const changeFormStatus = async (status: boolean): Promise<void> => {
  console.log("[offerService] Cambiando estado del formulario a:", status);
  try {
    const formStatus = { estado: status }; // Enviar el estado deseado
    const response = await axios.post(
      `http://localhost:8001/estado/toggle-formulario/`,
      formStatus
    );
    console.log(
      "[offerService] Estado del formulario actualizado:",
      response.data
    );
  } catch (error: any) {
    console.error(
      "[offerService] Error cambiando estado:",
      error.response?.data
    );
    throw error;
  }
};

// Función combinada que permite controlar si se cambia el estado del formulario
export const saveOfferAndManageForm = async (
  offerData: IOffer,
  programs: any[],
  shouldChangeForm?: boolean,
  newFormStatus?: boolean
): Promise<{
  offerResult: { created: number; updated: number; skipped: number };
  formChanged: boolean;
}> => {
  try {
    // 1. Guardar ofertas
    const offerResult = await offerElectives(offerData, programs);

    // 2. Manejar estado del formulario solo si se solicita explícitamente
    let formChanged = false;

    if (shouldChangeForm && newFormStatus !== undefined) {
      await changeFormStatus(newFormStatus);
      formChanged = true;
      console.log(
        `[offerService] Estado del formulario cambiado a: ${newFormStatus}`
      );
    }

    return {
      offerResult,
      formChanged,
    };
  } catch (error) {
    console.error("Error en el proceso completo:", error);
    throw error;
  }
};
