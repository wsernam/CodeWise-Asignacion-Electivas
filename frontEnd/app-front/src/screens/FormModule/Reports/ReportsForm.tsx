import React, { useEffect, useState } from "react";
import Card from "../../../components/ui/Card/Card";
import ReportFilters from "./ReportFilters";
import { useReportStore } from "../../../store/Form/reportStore";
import { selectionReportService } from "../../../services/Form/selectionReportService";
import { offerReportService } from "../../../services/Form/offerReportService";
import "./ReportsAssignment.css";

const ReportsForm: React.FC = () => {
  const {
    selectedYear,
    selectedSemester,
    selectedReportType,
    studentCode,
    isGenerating,
    generatedReport,
    setSelectedYear,
    setSelectedSemester,
    setSelectedReportType,
    setStudentCode,
    setIsGenerating,
    setGeneratedReport,
    clearReport,
  } = useReportStore();

  // Estado para modal de advertencia
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Limpia el blob anterior al desmontar
  useEffect(() => {
    return () => {
      if (generatedReport) {
        URL.revokeObjectURL(generatedReport);
      }
    };
  }, [generatedReport]);

  // Validar si el botón debe estar deshabilitado
  const isGenerateDisabled = () => {
    if (!selectedYear || !selectedSemester) return true;
    if (selectedReportType === "student-elective-selection" && !studentCode)
      return true;
    return isGenerating;
  };

  const showWarning = (message: string) => {
    setWarningMessage(message);
    setShowWarningModal(true);
  };

  const handleGenerateReport = async () => {
    // Validaciones
    if (!selectedYear || !selectedSemester) {
      showWarning("Por favor selecciona año y semestre");
      return;
    }

    if (selectedReportType === "student-elective-selection" && !studentCode) {
      showWarning("Por favor ingresa el código del estudiante");
      return;
    }

    setIsGenerating(true);
    clearReport();

    try {
      let blob: Blob;

      switch (selectedReportType) {
        case "student-elective-selection":
          blob = await selectionReportService.getStudentSelectionReport(
            studentCode,
            selectedYear,
            selectedSemester
          );
          break;

        case "offer-report":
          blob = await offerReportService.getElectiveOfferReport(
            selectedYear,
            selectedSemester
          );
          break;

        default:
          throw new Error("Tipo de reporte no válido");
      }

      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      setGeneratedReport(url);
    } catch (error: any) {
      // Alert mientras separo warning
      alert(error.message || "Error generando el reporte");
      console.error("Error generando el reporte:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-content">
        <Card className="main-card reports-card">
          <div className="reports-header">
            <h2>Generación de Reportes de Formularios</h2>
            <p>Seleccione los filtros y genere el reporte deseado</p>
          </div>

          {/* Filtros con campo integrado para estudiante */}
          <ReportFilters
            selectedYear={selectedYear}
            selectedSemester={selectedSemester}
            selectedReportType={selectedReportType}
            studentCode={studentCode}
            onYearChange={setSelectedYear}
            onSemesterChange={setSelectedSemester}
            onReportTypeChange={setSelectedReportType}
            onStudentCodeChange={setStudentCode}
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            isGenerateDisabled={isGenerateDisabled()}
            reportTypeOptions={[
              {
                value: "student-elective-selection",
                label: "Electivas Seleccionadas por Estudiante",
              },
              {
                value: "offer-report",
                label: "Reporte de Oferta de Electivas",
              },
            ]}
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
    </div>
  );
};

export default ReportsForm;
