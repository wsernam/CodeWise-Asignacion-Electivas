export const getFechaFinalizacion = (procesoId: number): string | null => {
  if (typeof window === "undefined") return null;

  const fechaStr = localStorage.getItem(`proceso_finalizado_${procesoId}`);
  if (!fechaStr) return null;

  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const setFechaFinalizacion = (procesoId: number): void => {
  if (typeof window === "undefined") return;

  const fechaFinalizacion = new Date().toISOString();
  localStorage.setItem(`proceso_finalizado_${procesoId}`, fechaFinalizacion);
};
