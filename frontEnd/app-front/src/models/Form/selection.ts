export interface ISelectionStudentElective {
  est_codigo: number;
  est_correo: string;
  sel_anio: number;
  sel_num_semestre: number;
  electivas: {
    ele_codigo: string;
    sel_prioridad: number;
  }[];
}
