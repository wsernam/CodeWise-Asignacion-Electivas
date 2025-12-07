export interface AssignmentProcess {
  pa_codigo: number;
  pa_anio: number;
  pa_num_semestre: 1 | 2;
  pa_estado: number; // 1=activo, 2=inactivo
  pa_paso_actual: number; // 1=creado, 2=archivos-guardados, 4=nivelados-gestionados, 5=asignacion-realizada, 6=finalizado
  pa_fecha_creacion: string;
  pa_ultima_fecha_actualizacion: string;
}
export interface ValidationResult {
  cache_key: string;
  faltantes: string[];
  sobrantes: string[];
  num_faltantes: number;
  num_sobrantes: number;
  coinciden: boolean;
  periodo_evaluado: string;
  advertencias: string[];
}

export interface IncompleteRow {
  codigo: number;
  fila: number;
  archivo: string;
}

export interface LeveledStudent {
  estudiante: {
    est_codigo: number;
    est_nombre: string;
    est_apellido: string;
    programa: {
      pro_codigo: string;
      pro_nombre: string;
    };
  };
  creditos_aprob_total: number;
  porcentaje_avance: number;
  num_periodos_matriculados: number;
}

export interface InactiveStudent {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  programa: string;
  creditosObligatorios: string;
  periodosMatriculados: string;
  porcentajeAvance: string;
}

export interface ConfirmLeveledRequest {
  est_codigo: number;
  nivelado: number; // 1 o 0
}

export interface CodeBatchesResponse {
  anio: number;
  semestre: number;
  total_estudiantes: number;
  lote_size: number;
  lotes: number[][];
}
