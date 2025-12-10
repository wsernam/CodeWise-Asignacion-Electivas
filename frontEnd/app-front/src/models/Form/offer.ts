export interface IOffer {
  ofe_anio: number;
  ofe_num_semestre: number;
  ofe_cant_electivas: number;
  ofertas: {
    ele_codigo: string;
    pro_codigo: string;
  }[];
}

export interface IOfferForm {
  ofe_anio: number;
  ofe_num_semestre: number;
  ofe_cant_electivas: number;
  pro_codigo: string;
}