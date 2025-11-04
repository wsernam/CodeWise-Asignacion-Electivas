import { create } from "zustand";
import { excelProcessingService } from "../../services/Assignment";
import type {
  ValidationResult,
  IncompleteRow,
} from "../../models/Assignment/assignmentProcess";

interface ExcelProcessingState {
  // ========== ESTADO ==========
  uploadedFiles: File[]; // Archivos Excel subidos
  validationResult: ValidationResult | null; // Resultado de validación
  cacheKey: string | null; // Clave de caché para archivos
  incompleteRows: IncompleteRow[]; // Filas con datos incompletos
  loading: boolean;
  error: string | null;

  // ========== ACCIONES ==========
  validarExcel: (files: File[]) => Promise<ValidationResult>;
  previsualizarIncompletos: (
    files: File[]
  ) => Promise<{ filas_incompletas: IncompleteRow[]; advertencias: string[] }>;
  completarYProcesar: (
    filasACompletar?: Array<{
      archivo: string;
      fila: number;
      datos: Record<string, any>;
    }>
  ) => Promise<any>;
  importarPerfiles: (files: File[]) => Promise<any>;
  clearError: () => void;
  reset: () => void;
}

/**
 * PROCESAMIENTO DE ARCHIVOS EXCEL
 * Este store maneja toda la lógica de validación, previsualización
 * y procesamiento de archivos Excel con perfiles académicos.
 * Se usa en UploadFilesAP e InactivesManagementAP.
 */
export const useExcelProcessingStore = create<ExcelProcessingState>(
  (set, get) => ({
    // ========== ESTADO INICIAL ==========
    uploadedFiles: [],
    validationResult: null,
    cacheKey: null,
    incompleteRows: [],
    loading: false,
    error: null,

    // ========== ACCIONES ==========

    /**
     * VALIDAR ARCHIVOS EXCEL CONTRA LA BASE DE DATOS
     * Se conecta con: excelProcessingService.validarExcel()
     * @param files - Archivos Excel a validar
     * @returns Resultado de validación con estudiantes faltantes/sobrantes
     * En UploadFilesAP después de subir archivos
     */
    validarExcel: async (files: File[]) => {
      set({ loading: true, error: null });
      try {
        const result = await excelProcessingService.validarExcel(files);
        set({
          validationResult: result,
          cacheKey: result.cache_key,
          uploadedFiles: files,
          loading: false,
        });
        return result;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    /**
     * PREVISUALIZAR FILAS INCOMPLETAS EN LOS ARCHIVOS EXCEL
     * Se conecta con: excelProcessingService.previsualizarIncompletos()
     * @param files - Archivos Excel a analizar
     * @returns Filas identificadas como incompletas
     * En InactivesManagementAP para detectar estudiantes con datos faltantes
     */
    previsualizarIncompletos: async (files: File[]) => {
      set({ loading: true, error: null });
      try {
        const result = await excelProcessingService.previsualizarIncompletos(
          files
        );
        set({
          incompleteRows: result.filas_incompletas || [],
          loading: false,
        });
        return result;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    /**
     * COMPLETAR DATOS FALTANTES Y PROCESAR IMPORTACIÓN FINAL
     * Se conecta con: excelProcessingService.completarYProcesar()
     * @param filasACompletar - Filas que el usuario completó manualmente
     * @returns Resultado del procesamiento
     * En InactivesManagementAP después de editar estudiantes inactivos
     */
    completarYProcesar: async (filasACompletar = []) => {
      set({ loading: true, error: null });
      try {
        const { cacheKey } = get();
        if (!cacheKey)
          throw new Error("No hay archivos en caché para procesar");

        const result = await excelProcessingService.completarYProcesar(
          cacheKey,
          filasACompletar
        );
        set({ loading: false });
        return result;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    /**
     * IMPORTAR PERFILES ACADÉMICOS A LA BASE DE DATOS
     * Se conecta con: excelProcessingService.importarPerfiles()
     * @param files - Archivos Excel procesados
     * @returns Resultado de la importación
     * Paso final después de completar todas las validaciones
     */
    importarPerfiles: async (files: File[]) => {
      set({ loading: true, error: null });
      try {
        const result = await excelProcessingService.importarPerfiles(files);
        set({ loading: false });
        return result;
      } catch (error: any) {
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    clearError: () => set({ error: null }),

    reset: () =>
      set({
        uploadedFiles: [],
        validationResult: null,
        cacheKey: null,
        incompleteRows: [],
        loading: false,
        error: null,
      }),
  })
);
