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

  // Limpia el blob anterior al desmontar
  useEffect(() => {
    return () => {
      if (generatedReport) {
        URL.revokeObjectURL(generatedReport);
      }
    };
  }, [generatedReport]);

  const handleGenerateReport = async () => {
    // Validaciones básicas
    if (!selectedYear || !selectedSemester) {
      alert("Por favor selecciona año y semestre");
      return;
    }

    if (selectedReportType === "student-elective-selection" && !studentCode) {
      alert("Por favor ingresa el código del estudiante");
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

        case "general-selection":
          // TODO: Implementar cuando tengas el endpoint
          throw new Error("Reporte general de selección no implementado aún");

        case "enrolled-list":
          // TODO: Implementar cuando tengas el endpoint
          throw new Error("Lista de inscritos no implementado aún");

        default:
          throw new Error("Tipo de reporte no válido");
      }

      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      setGeneratedReport(url);
    } catch (error: any) {
      alert(error.message || "Error generando el reporte");
      console.error("Error generating report:", error);
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

          {/* Filtros */}
          <ReportFilters
            selectedYear={selectedYear || 2024} // Valor por defecto para el select
            selectedSemester={selectedSemester || 1} // Valor por defecto para el select
            selectedReportType={selectedReportType}
            onYearChange={setSelectedYear}
            onSemesterChange={setSelectedSemester}
            onReportTypeChange={setSelectedReportType}
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            reportTypeOptions={[
              {
                value: "general-selection",
                label: "Reporte General Proceso de Selección",
              },
              {
                value: "student-elective-selection",
                label: "Electivas Seleccionadas por Estudiante",
              },
              {
                value: "offer-report",
                label: "Reporte de Oferta de Electivas",
              },
              {
                value: "enrolled-list",
                label: "Lista de Estudiantes Inscritos",
              },
            ]}
          />

          {/* Campo adicional para código de estudiante */}
          {selectedReportType === "student-elective-selection" && (
            <div className="filters-section" style={{ marginTop: "-1rem" }}>
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Código Estudiante</label>
                  <input
                    className="filter-select"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="Ej: 104621011376"
                  />
                </div>
              </div>
            </div>
          )}

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
