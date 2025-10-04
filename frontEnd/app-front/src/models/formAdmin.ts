export interface FormAdmin {
  for_codigo: number;
  for_estado: boolean;
  for_fecha_inicio: string; // ISO date string
  for_fecha_fin: string; // ISO date string
  electivesByProgram: { [programa: string]: string[] }; // Mapeo de programa a lista de códigos de electivas
}
