import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import ReportFilters from "./ReportFilters";
import "./ReportsAssignment.css";

interface IReportFiltersProps {
  selectedYear: number;
  selectedSemester: 1 | 2;
  selectedReportType: string;
  onYearChange: (year: number) => void;
  onSemesterChange: (semester: 1 | 2) => void;
  onReportTypeChange: (type: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ReportsForm: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedReportType, setSelectedReportType] =
    useState<string>("general-seleccion");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    // Mock PDF
    setTimeout(() => {
      setGeneratedReport("https://example.com/report-formularios.pdf");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="reports-page-container">
      <DashboardLayout>
        <div className="reports-content">
          <Card className="main-card reports-card">
            <div className="reports-header">
              <h2>Generación de Reportes de Formularios</h2>
              <p>Seleccione los filtros y genere el reporte deseado</p>
            </div>

            {/* Filtros */}
            <ReportFilters
              selectedYear={selectedYear}
              selectedSemester={selectedSemester}
              selectedReportType={selectedReportType}
              onYearChange={setSelectedYear}
              onSemesterChange={setSelectedSemester}
              onReportTypeChange={setSelectedReportType}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating}
              reportTypeOptions={[
                {
                  value: "general-seleccion",
                  label: "Reporte General Proceso de Selección",
                },
                {
                  value: "electivas-estudiante",
                  label: "Electivas Seleccionadas por Estudiante",
                },
                {
                  value: "lista-inscritos",
                  label: "Lista de Estudiantes Inscritos",
                },
              ]}
            />

            {/* PDF */}
            <div className="pdf-viewer-section">
              <h3>Vista Previa del Reporte</h3>
              <div className="pdf-viewer">
                {generatedReport ? (
                  <iframe
                    src={generatedReport}
                    className="pdf-iframe"
                    title="Reporte Generado"
                  />
                ) : (
                  <div className="pdf-placeholder">
                    <p>
                      Seleccione los filtros y genere un reporte para
                      visualizarlo aquí
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default ReportsForm;
