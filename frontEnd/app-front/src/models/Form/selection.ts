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

export interface ISelectionDashboard {
  ele_codigo: string;
  ele_nombre: string;
  inscritos: number;
  pro_codigo: string;
}
