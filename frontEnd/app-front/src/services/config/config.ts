// Configuration file for API endpoints
export const API_BASE_URL = "http://localhost:8001/";

// Endpoints para el servicio de formularios (puerto 8001)
export const PROGRAMS_URL = `${API_BASE_URL}api/programas`;
export const FACULTIES_URL = `${API_BASE_URL}api/facultades`;
export const ELECTIVES_URL = `${API_BASE_URL}api/electivas`;
export const STUDENT_URL = `${API_BASE_URL}api/estudiantes`;
export const FORM_STATUS_URL = `${API_BASE_URL}estado`;
export const OFFER_URL = `${API_BASE_URL}ofertaElectiva`;
export const SELECTION_URL = `${API_BASE_URL}/api/seleccion-electivas`;

// Endpoints para el servicio de asignación
export const ASSIGNMENT_API_BASE_URL = "http://localhost:8002/api/";

// Endpoints para el servicio de asignación (puerto 8002)
export const ASSIGNMENT_BASE_URL = `${ASSIGNMENT_API_BASE_URL}asignacion`;
export const NIVELADOS_URL = `${ASSIGNMENT_API_BASE_URL}nivelados`;

// Endpoints para el servicio de procesamiento de Excel
export const EXCEL_PROCESSING_URL =
  "http://localhost:8002/inventario/api/excel";

// Luego vemos
export const LOGIN_URL = `${API_BASE_URL}login`;
//export const STUDENT_DATA_URL = `${API_BASE_URL}api/student`;
//export const PROGRAMS_URL = `${API_BASE_URL}api/programs`;
//export const FORM_URL = `${API_BASE_URL}api/forms`;
export const REPORTS_BASE_URL = `${ASSIGNMENT_API_BASE_URL}reporte-asignacion/pdf`;
