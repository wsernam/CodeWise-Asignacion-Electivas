export interface IOffer {
  for_year: number;
  for_semester: number;
  for_status: boolean;
  electivesByProgram: { [programa: string]: string[] }; // Mapeo de programa a lista de códigos de electivas
}
