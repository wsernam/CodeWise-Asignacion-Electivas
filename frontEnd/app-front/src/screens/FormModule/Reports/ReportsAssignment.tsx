import React, { useEffect, useState } from "react";
import Card from "../../../components/ui/Card/Card";
import ReportFilters from "./ReportFilters";
import { reporteService } from "../../../services/Assignment/reporteService";
import "./ReportsAssignment.css";

const ReportsAssignment: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedReportType, setSelectedReportType] =
    useState<string>("general");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // extras según tipo
  const [estId, setEstId] = useState<string>("");
  const [eleCodigo, setEleCodigo] = useState<string>("");

  // Limpia el blob anterior
  useEffect(() => {
    return () => {
      if (generatedReport) URL.revokeObjectURL(generatedReport);
    };
  }, [generatedReport]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      let blob: Blob;

      if (selectedReportType === "listas") {
        blob = await reporteService.getGeneralBlob(
          selectedYear,
          selectedSemester
        );
      } else if (selectedReportType === "por-estudiante") {
        if (!estId) throw new Error("Ingresa el código de estudiante");
        blob = await reporteService.getEstudianteBlob(
          estId,
          selectedYear,
          selectedSemester
        );
      } else if (selectedReportType === "por-electiva") {
        if (!eleCodigo) throw new Error("Ingresa el código de la electiva");
        blob = await reporteService.getElectivaBlob(
          eleCodigo,
          selectedYear,
          selectedSemester
        );
      } else {
        throw new Error("Tipo de reporte no implementado en frontend");
      }

      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      setGeneratedReport(url);
    } catch (e: any) {
      alert(e.message || "Error generando el reporte");
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
            onYearChange={setSelectedYear}
            onSemesterChange={setSelectedSemester}
            onReportTypeChange={setSelectedReportType}
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            isGenerateDisabled={false} // Agregar esta prop faltante
          />

          {/* Campos extra según tipo */}
          {selectedReportType === "por-estudiante" && (
            <div className="filters-section" style={{ marginTop: "-1rem" }}>
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Código Estudiante</label>
                  <input
                    className="filter-select"
                    value={estId}
                    onChange={(e) => setEstId(e.target.value)}
                    placeholder="Ej: 104621011376"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedReportType === "por-electiva" && (
            <div className="filters-section" style={{ marginTop: "-1rem" }}>
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Código Electiva</label>
                  <input
                    className="filter-select"
                    value={eleCodigo}
                    onChange={(e) => setEleCodigo(e.target.value)}
                    placeholder="Ej: ELEC001"
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

export default ReportsAssignment;
