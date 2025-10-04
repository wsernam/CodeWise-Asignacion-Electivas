export interface FormAdmin {
  for_year: number;
  for_semester: number;
  for_status: boolean;
  for_start_date: string;
  for_end_date: string;
  electivesByProgram: { [programa: string]: string[] }; // Mapeo de programa a lista de códigos de electivas
}
