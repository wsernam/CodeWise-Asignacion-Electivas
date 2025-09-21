// src/services/ElectiveService.ts
import type { IElective } from "../Models/elective";

const USE_MOCK = true; // 🔹 Cambia a false cuando tengas backend
const API_URL = "/api/electives"; // tu endpoint en Node

// Datos quemados para probar
let mockElectives: IElective[] = [
  { codigo: "01", nombre: "Ingeniería de Requisitos", programa: "Ingeniería de Sistemas" },
  { codigo: "02", nombre: "ASAE", programa: "Ingeniería de Sistemas" },
  { codigo: "03", nombre: "Microservicios", programa: "Ingeniería de Sistemas" },
];

export const ElectiveService = {
  // Obtener todas las electivas
  getAll: async (): Promise<IElective[]> => {
    if (USE_MOCK) {
      // Simula un fetch con delay
      return new Promise((resolve) => setTimeout(() => resolve(mockElectives), 300));
    } else {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener electivas");
      return res.json();
    }
  },

  // Agregar electiva
  add: async (elective: IElective) => {
    if (USE_MOCK) {
      mockElectives.push(elective);
      return new Promise((resolve) => setTimeout(() => resolve(elective), 300));
    } else {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(elective),
      });
      if (!res.ok) throw new Error("Error al agregar electiva");
      return res.json();
    }
  },

  // Actualizar electiva
  update: async (codigo: string, updated: IElective) => {
    if (USE_MOCK) {
      mockElectives = mockElectives.map((e) => (e.codigo === codigo ? updated : e));
      return new Promise((resolve) => setTimeout(() => resolve(updated), 300));
    } else {
      const res = await fetch(`${API_URL}/${codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar electiva");
      return res.json();
    }
  },

  // Eliminar electiva
  delete: async (codigo: string) => {
    if (USE_MOCK) {
      mockElectives = mockElectives.filter((e) => e.codigo !== codigo);
      return new Promise((resolve) => setTimeout(() => resolve(true), 300));
    } else {
      const res = await fetch(`${API_URL}/${codigo}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar electiva");
      return true;
    }
  },
};
