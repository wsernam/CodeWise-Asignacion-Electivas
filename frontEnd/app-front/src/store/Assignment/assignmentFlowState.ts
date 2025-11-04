import { create } from "zustand";
import type { InactiveStudent } from "../../models/Assignment/assignmentProcess";

interface AssignmentFlowState {
  // ========== ESTADO ==========
  currentStep: number; // Paso actual del flujo (1-4)
  completedSteps: number[]; // Pasos completados
  inactiveStudents: InactiveStudent[]; // Estudiantes inactivos
  loading: boolean;
  error: string | null;

  // ========== ACCIONES ==========
  setCurrentStep: (step: number) => void;
  addCompletedStep: (step: number) => void;
  setInactiveStudents: (students: InactiveStudent[]) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * CONTROL DEL FLUJO DE ASIGNACIÓN
 * Este store maneja únicamente el estado de la UI y navegación
 * entre los diferentes pasos del proceso de asignación.
 * NO se conecta al backend.
 */
export const useAssignmentFlowStore = create<AssignmentFlowState>((set) => ({
  // ========== ESTADO INICIAL ==========
  currentStep: 1,
  completedSteps: [],
  inactiveStudents: [],
  loading: false,
  error: null,

  // ========== ACCIONES ==========

  /**
   * CAMBIAR PASO ACTUAL DEL FLUJO
   * @param step - Número del paso (1: Excel, 2: Inactivos, 3: Nivelados, 4: Asignación)
   * En todos los componentes de pasos para navegar entre ellos
   */
  setCurrentStep: (step: number) => set({ currentStep: step }),

  /**
   * MARCAR PASO COMO COMPLETADO
   * @param step - Paso completado
   * Al finalizar cada paso exitosamente
   */
  addCompletedStep: (step: number) =>
    set((state) => ({
      completedSteps: [...new Set([...state.completedSteps, step])],
    })),

  /**
   * ACTUALIZAR LISTA DE ESTUDIANTES INACTIVOS
   * @param students - Estudiantes identificados como inactivos
   * En InactivesManagementAP para guardar cambios locales
   */
  setInactiveStudents: (students: InactiveStudent[]) =>
    set({ inactiveStudents: students }),

  clearError: () => set({ error: null }),

  /**
   * REINICIAR FLUJO COMPLETO
   */
  reset: () =>
    set({
      currentStep: 1,
      completedSteps: [],
      inactiveStudents: [],
      loading: false,
      error: null,
    }),
}));
