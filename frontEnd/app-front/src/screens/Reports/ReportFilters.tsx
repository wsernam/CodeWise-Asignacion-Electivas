import React from "react";
import Button from "../../components/ui/Button/Button";

interface IReportTypeOption {
  value: string;
  label: string;
}

interface IReportFiltersProps {
  selectedYear: number;
  selectedSemester: 1 | 2;
  selectedReportType: string;
  onYearChange: (year: number) => void;
  onSemesterChange: (semester: 1 | 2) => void;
  onReportTypeChange: (type: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  reportTypeOptions?: IReportTypeOption[]; // prop opcional
}

const ReportFilters: React.FC<IReportFiltersProps> = ({
  selectedYear,
  selectedSemester,
  selectedReportType,
  onYearChange,
  onSemesterChange,
  onReportTypeChange,
  onGenerate,
  isGenerating,
  reportTypeOptions, // Recibe las opciones personalizadas
}) => {
  const yearOptions = [2024, 2025, 2026];

  // Opciones por defecto para asignación, o usa las personalizadas
  const defaultReportTypeOptions = [
    { value: "general", label: "Reporte General" },
    { value: "por-estudiante", label: "Por Estudiante" },
    { value: "por-electiva", label: "Por Electiva" },
    { value: "por-programa", label: "Por Programa Académico" },
    { value: "listas", label: "Lista asignación y espera" },
  ];

  const finalReportTypeOptions = reportTypeOptions || defaultReportTypeOptions;

  return (
    <div className="filters-section">
      <h3>Filtros del Reporte</h3>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="year-select" className="filter-label">
            Año
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="filter-select"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="semester-select" className="filter-label">
            Semestre
          </label>
          <select
            id="semester-select"
            value={selectedSemester}
            onChange={(e) => onSemesterChange(Number(e.target.value) as 1 | 2)}
            className="filter-select"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="report-type-select" className="filter-label">
            Tipo de Reporte
          </label>
          <select
            id="report-type-select"
            value={selectedReportType}
            onChange={(e) => onReportTypeChange(e.target.value)}
            className="filter-select"
          >
            {finalReportTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" style={{ visibility: "hidden" }}>
            Acción
          </label>
          <Button
            variant="primary"
            onClick={onGenerate}
            disabled={isGenerating}
            className="generate-btn"
          >
            {isGenerating ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
