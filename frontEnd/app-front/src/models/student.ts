export interface IStudent {
  codigo: string;
  email: string;
  nombre: string;
  apellido: string;
  programa: string;
  electivas: string[]; // Electivas en orden de prioridad [1°, 2°, ..., 5°]
}
