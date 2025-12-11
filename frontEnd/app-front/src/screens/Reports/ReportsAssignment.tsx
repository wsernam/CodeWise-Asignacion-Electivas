import { useLocation } from "react-router";
import React, { useEffect, useState, useMemo } from "react";
import Card from "../../components/ui/Card/Card";
import ReportFilters from "./ReportFilters";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import { useAssignmentProcessStore } from "../../store/Assignment";
import { reporteService } from "../../services/Reports/reportService";
import "./ReportsAssignment.css";

const ReportsAssignment: React.FC = () => {
  const location = useLocation();
  const isPreview = location.state?.isPreview || false;
  const previewProcessId = location.state?.processId;

  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedReportType, setSelectedReportType] =
    useState<string>("general");
  const [estId, setEstId] = useState<string>("");
  const [eleCodigo, setEleCodigo] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });
  // Obtener procesos para años disponibles
  const { allProcess, obtenerTodosLosProcesos } = useAssignmentProcessStore();

  // Cargar procesos al inicio
  useEffect(() => {
    obtenerTodosLosProcesos();
  }, [obtenerTodosLosProcesos]);

  const isNumeric = (value: string) => /^\d+$/.test(value);
  const currentYear = new Date().getFullYear();
  const minYear = 2000;
  const maxYear = currentYear + 1;
  const isYearValid = (year: number) => year >= minYear && year <= maxYear;

  // Calcular años disponibles de procesos
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allProcess.forEach((process) => {
      years.add(process.pa_anio);
    });
    return Array.from(years).sort((a, b) => b - a); // Orden descendente
  }, [allProcess]);

  // Si no hay procesos, usar año actual
  const finalYears =
    availableYears.length > 0 ? availableYears : [new Date().getFullYear()];

  // Validación centralizada - MUY IMPORTANTE
  const isGenerateDisabled =
    isGenerating ||
    !isYearValid(selectedYear) ||
    !isNumeric(String(selectedYear)) ||
    (selectedReportType === "por-estudiante" &&
      (!estId.trim() || !isNumeric(estId))) ||
    (selectedReportType === "por-electiva" && !eleCodigo.trim());

  // Limpiar blob anterior
  useEffect(() => {
    return () => {
      if (generatedReport) URL.revokeObjectURL(generatedReport);
    };
  }, [generatedReport]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      let blob: Blob;

      // Validaciones
      if (!isNumeric(String(selectedYear)) || !isYearValid(selectedYear)) {
        setShowWarningModal({
          open: true,
          message: `El año debe ser un número entre ${minYear} y ${maxYear}.`,
        });
        setIsGenerating(false);
        return;
      }
      if (
        selectedReportType === "por-estudiante" &&
        (!isNumeric(estId) || !estId.trim())
      ) {
        setShowWarningModal({
          open: true,
          message: "El código de estudiante debe contener solo números.",
        });
        setIsGenerating(false);
        return;
      }

      if (isPreview && previewProcessId) {
        // Verificar si el proceso aún existe en la lista
        const procesoExiste = allProcess.some(
          (p) => p.pa_codigo === previewProcessId
        );

        if (!procesoExiste) {
          setShowWarningModal({
            open: true,
            message:
              "El proceso de asignación ha sido eliminado. No se pueden visualizar los reportes.",
          });
          setIsGenerating(false);
          return;
        }
      }

      switch (selectedReportType) {
        case "listas":
          blob = await reporteService.getListasBlob(
            selectedYear,
            selectedSemester
          );
          break;
        case "por-estudiante":
          blob = await reporteService.getEstudianteBlob(
            estId,
            selectedYear,
            selectedSemester
          );
          break;
        case "por-electiva":
          blob = await reporteService.getElectivaBlob(
            eleCodigo,
            selectedYear,
            selectedSemester
          );
          break;
        case "general":
          blob = await reporteService.getGeneralBlob(
            selectedYear,
            selectedSemester
          );
          break;
        default:
          throw new Error("Tipo de reporte no implementado");
      }

      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      setGeneratedReport(url);
    } catch (e: any) {
      const message =
        e.message && e.message.includes("404")
          ? "No se encontró información para los filtros seleccionados"
          : e.message || "Ocurrió un error al generar el reporte";

      setShowWarningModal({
        open: true,
        message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-content">
        <Card className="main-card reports-card">
          <div className="reports-header">
            <h2>Generación de Reportes de Asignación</h2>
            <p>Seleccione los filtros y genere el reporte deseado</p>
          </div>

          <ReportFilters
            selectedYear={selectedYear}
            selectedSemester={selectedSemester}
            selectedReportType={selectedReportType}
            studentCode={estId} //  Pasa el estado
            electiveCode={eleCodigo} //  Pasa el estado
            onYearChange={setSelectedYear}
            onSemesterChange={setSelectedSemester}
            onReportTypeChange={setSelectedReportType}
            onStudentCodeChange={setEstId} //  Pasa el setter
            onElectiveCodeChange={setEleCodigo} //  Pasa el setter
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            isGenerateDisabled={isGenerateDisabled}
            module="assignment" //  IMPORTANTE: indica que es de asignación
            availableYears={finalYears} // Pasa los años disponibles
          />
          {/* Visor PDF */}
          <div className="pdf-viewer-section">
            <h3>Vista Previa del Reporte</h3>
            <div className={`pdf-viewer ${generatedReport ? "has-pdf" : ""}`}>
              {generatedReport ? (
                <iframe
                  src={generatedReport}
                  className="pdf-iframe"
                  title="Reporte Generado"
                />
              ) : (
                <div className="pdf-placeholder">
                  <p>
                    Seleccione los filtros y genere un reporte para visualizarlo
                    aquí
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <WarningModal
        open={showWarningModal.open}
        message={showWarningModal.message}
        onClose={() => setShowWarningModal({ open: false, message: "" })}
      />
    </div>
  );
};

export default ReportsAssignment;
