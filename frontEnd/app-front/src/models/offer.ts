export interface IOffer {
  ofe_anio: number;
  ofe_num_semestre: number;
  ofertas: {
    ele_codigo: string;
    pro_codigo: string;
  }[];
}
