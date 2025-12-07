import { create } from "zustand";
import { excelProcessingService } from "../../services/Assignment";
import type {
  ValidationResult,
  IncompleteRow,
} from "../../models/Assignment/assignmentProcess";

export interface InactiveStudent {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  programa: string;
  creditosObligatorios: number;
}

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
      externalCacheKey?: string;
    }>
  ) => Promise<any>;
  importarPerfiles: (
    files: File[],
    anio?: number,
    semester?: number
  ) => Promise<any>;
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
        // 1. Primero buscar en store
        let { cacheKey } = get();

        // 2. Si no está en store, buscar en localStorage
        if (!cacheKey) {
          cacheKey = localStorage.getItem("excel_cache_key");
          console.log("[DEBUG] cacheKey desde localStorage:", cacheKey);
        }

        if (!cacheKey) {
          throw new Error(
            "No hay archivos en caché para procesar. Vuelve al paso 1."
          );
        }

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
     * Se conecta con: excelProcessingService.completarYProcesar()
     * @param files - Archivos Excel procesados
     * @param anio - Año del proceso (opcional, para logging)
     * @param semestre - Semestre del proceso (opcional, para logging)
     * @returns Resultado de la importación
     * Paso final después de completar todas las validaciones
     */
    importarPerfiles: async (
      files: File[],
      anio?: number,
      semestre?: number
    ) => {
      set({ loading: true, error: null });

      try {
        // 1. Buscar cacheKey
        let { cacheKey } = get();

        if (!cacheKey) {
          cacheKey = localStorage.getItem("excel_cache_key");
          console.log("[DEBUG] cacheKey desde localStorage:", cacheKey);
        }

        if (!cacheKey) {
          throw new Error(
            "No hay archivos en caché para procesar. Vuelve al paso 1."
          );
        }

        // 2. Registrar año/semestre si están disponibles (solo para logs)
        if (anio !== undefined && semestre !== undefined) {
          console.log(
            "[DEBUG] Importando perfiles para periodo:",
            anio,
            "-",
            semestre
          );
        }

        // 3. Importar perfiles (reutilizar completarYProcesar)
        console.log("[DEBUG] Importando perfiles con cacheKey:", cacheKey);
        const result = await excelProcessingService.completarYProcesar(
          cacheKey,
          [] // Sin filas a completar - solo importar
        );

        console.log("[DEBUG] Resultado de importar perfiles:", result);

        // 4. Verificación BÁSICA basada en la respuesta
        if (result.resumen) {
          const { total_registros, creados, actualizados } = result.resumen;
          console.log(
            `[DEBUG] Resumen importación: ${total_registros} total, ${creados} creados, ${actualizados} actualizados`
          );

          // Advertencia si no se creó ningún perfil nuevo
          if (creados === 0 && actualizados === 0) {
            console.warn(
              "[ADVERTENCIA] No se crearon ni actualizaron perfiles"
            );
          }
        }

        // 5. Advertencia sobre ranking si tenemos año/semestre
        if (anio !== undefined && semestre !== undefined) {
          console.warn(
            `[ADVERTENCIA IMPORTANTE] Verificar manualmente si se generó ranking para ${anio}-${semestre}`
          );
          console.warn(`[ADVERTENCIA] Sin ranking, la asignación estará vacía`);

          // Añadir warning al resultado
          result.warning = `Importación completada. Verifica que el ranking se generó para ${anio}-${semestre}. Sin ranking, la asignación estará vacía.`;
        }

        set({ loading: false });
        return result;
      } catch (error: any) {
        console.error("[DEBUG] Error en importarPerfiles:", error);
        set({
          loading: false,
          error: error.message || "Error al importar perfiles",
        });
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
