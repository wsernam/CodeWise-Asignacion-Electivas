// ReportsAssignment.tsx - COMPLETO Y CORREGIDO
import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card/Card";
import ReportFilters from "./ReportFilters";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import { reporteService } from "../../services/Assignment/reporteService";
import "./ReportsAssignment.css";

const ReportsAssignment: React.FC = () => {
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

  // Validación centralizada - MUY IMPORTANTE
  const isGenerateDisabled =
    isGenerating ||
    (selectedReportType === "por-estudiante" && !estId.trim()) ||
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
      const message = e.message.includes("404")
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
            studentCode={estId} // ← PASA el estado
            electiveCode={eleCodigo} // ← PASA el estado
            onYearChange={setSelectedYear}
            onSemesterChange={setSelectedSemester}
            onReportTypeChange={setSelectedReportType}
            onStudentCodeChange={setEstId} // ← PASA el setter
            onElectiveCodeChange={setEleCodigo} // ← PASA el setter
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            isGenerateDisabled={isGenerateDisabled}
            module="assignment" // ← IMPORTANTE: indica que es de asignación
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
