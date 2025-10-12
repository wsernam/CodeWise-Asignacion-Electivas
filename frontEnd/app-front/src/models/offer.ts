export interface IOffer {
  for_year: number;
  for_semester: number;
  electivesByProgram: { [programa: string]: string[] }; // Mapeo de programa a lista de códigos de electivas
}

export interface IAcademicOffer {
  ofe_anio: number;
  ofe_num_semestre: number;
  ele_codigo: string;
  pro_codigo: string;
}
