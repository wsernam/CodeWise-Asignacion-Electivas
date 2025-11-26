// Configuration file for API endpoints
//------------------------------------------------------------------------------
//RUTAS PARA GESTION FORMULARIO
//------------------------------------------------------------------------------
//PUBLICOS
export const API_BASE_UR_FORM_PUBLIC = "http://localhost:8000/gestion-formulario/";
//PRIVADOS
export const API_BASE_URL_FORM_PRIVATE = "http://localhost:8000/gestion-formulario/admin/";
// Endpoints para el servicio de formularios (puerto 8001)
//PUBLICOS
export const PROGRAMS_URL_PUBLIC = `${API_BASE_UR_FORM_PUBLIC}programas`;
export const ELECTIVES_URL_PUBLIC = `${API_BASE_UR_FORM_PUBLIC}electivas`;
export const STUDENT_URL_PUBLIC = `${API_BASE_UR_FORM_PUBLIC}estudiantes`;
export const FORM_STATUS_URL_PUBLIC = `${API_BASE_UR_FORM_PUBLIC}`;
export const OFFER_URL_PUBLIC = `${API_BASE_UR_FORM_PUBLIC}`;
export const SELECTION_URL_PUBLIC = `${API_BASE_UR_FORM_PUBLIC}selecciones/seleccion-electivas/`;
//PRIVADOS
export const PROGRAMS_URL_PRIVATE = `${API_BASE_URL_FORM_PRIVATE}programas`;
export const ELECTIVES_URL_PRIVATE = `${API_BASE_URL_FORM_PRIVATE}electivas`;
export const FORM_STATUS_URL_PRIVATE = `${API_BASE_URL_FORM_PRIVATE}`;
export const OFFER_URL_PRIVATE = `${API_BASE_URL_FORM_PRIVATE}`;
export const SELECTION_URL_PRIVATE = `${API_BASE_URL_FORM_PRIVATE}selecciones/seleccion-electivas/`;
// Endpoints para reportes de formularios
export const SELECTION_REPORT_URL_PRIVATE = `${API_BASE_URL_FORM_PRIVATE}reporte-seleccion`;
export const OFFER_REPORT_URL_PRIVATE = `${API_BASE_URL_FORM_PRIVATE}reporte-oferta`;


//------------------------------------------------------------------------------
//RUTAS PARA GESTION ASIGNACION
//------------------------------------------------------------------------------
export const ASSIGNMENT_API_BASE_URL_PRIVATE = "http://localhost:8000/gestion-asignacion/";

// Endpoints para el servicio de asignación 
export const ASSIGNMENT_URL_PRIVATE = `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/asignacion/ejecutar/`;
export const NIVELADOS_URL_PRIVATE = `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/nivelados`;
// Endpoints para el servicio de procesamiento de Excel
export const EXCEL_PROCESSING_URL_PRIVATE =`${ASSIGNMENT_API_BASE_URL_PRIVATE}inventario/api/excel`;
export const REPORTS_ASIGNACION_BASE_URL_PRIVATE = `${ASSIGNMENT_API_BASE_URL_PRIVATE}api/reporte-asignacion/pdf`;
//TODO: VERIFICAR
//------------------------------------------------------------------------------
//RUTAS PARA AUTENTICACIÓN
//------------------------------------------------------------------------------
export const AUTH_API_BASE_URL = "http://localhost:8000/auth/login/api/login/";

