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

export interface ISelectionElectivaDashboard {
  ele_codigo: string;
  ele_nombre: string;
  inscritos: number;
  pro_codigo: string;
}

export interface ISelectionTotalesDashboard {
  pro_codigo: string;
  total_inscritos: number;
}
export interface ISelectionDashboard {
  total: number;
  electivas: ISelectionElectivaDashboard[];
  totales: ISelectionTotalesDashboard[];
}
