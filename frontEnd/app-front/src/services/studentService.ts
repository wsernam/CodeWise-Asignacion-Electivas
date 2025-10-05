// services/studentService.ts
import type { IStudent } from "../models/student";
import type { IElective } from "../models/elective";
import { getElectivesService } from "./electiveService";

let students: IStudent[] = [
  {
    codigo: "202412345",
    email: "estudiante1@university.edu",
    nombre: "María",
    apellido: "González",
    programa: "01",
    electivas: ["101", "102", "103", "104", "105"],
  },
  {
    codigo: "202456789",
    email: "estudiante2@university.edu",
    nombre: "Carlos",
    apellido: "Rodríguez",
    programa: "02",
    electivas: ["102", "101", "104", "103", "105"],
  },
];

export const getStudentsService = async (): Promise<IStudent[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...students];
};

export const getStudentByCode = async (
  codigo: string
): Promise<IStudent | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const student = students.find((s) => s.codigo === codigo);
  return student || null;
};

export const getActiveElectivesForProgram = async (
  programa: string
): Promise<IElective[]> => {
  try {
    const allElectives = await getElectivesService();
    const activeElectives = allElectives.filter(
      (elective) => elective.active && elective.programa === programa
    );
    return activeElectives;
  } catch (error) {
    console.error("Error al obtener electivas activas:", error);
    return [];
  }
};

export const createStudentService = async (
  student: IStudent
): Promise<IStudent> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const existingStudent = students.find((s) => s.codigo === student.codigo);

  if (existingStudent) {
    const error: any = new Error("EXISTS_ACTIVE");
    error.existing = existingStudent;
    throw error;
  }

  // Validar 5 electivas exactas
  if (student.electivas.length !== 5) {
    const error: any = new Error("INVALID_ELECTIVES");
    error.details = [
      `Se requieren exactamente 5 electivas. Seleccionaste: ${student.electivas.length}`,
    ];
    throw error;
  }

  // Validar sin duplicados
  const uniqueElectives = new Set(student.electivas);
  if (uniqueElectives.size !== 5) {
    const error: any = new Error("INVALID_ELECTIVES");
    error.details = ["No se permiten electivas duplicadas"];
    throw error;
  }

  students.push(student);
  return student;
};
