import React, { useState, useEffect } from "react";
import { Select } from "antd";
import "./Offer.css";

// Components
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";

// Stores
import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore";
import { useFormStore } from "../../store/offerStore";
import type { IOffer as Offer } from "../../models/offer";

const { Option } = Select;

const Oferta: React.FC = () => {
  // ========== STORES ==========
  const { electives, fetchElectives } = useElectiveStore();
  const { programs, fetchPrograms } = useProgramStore();
  const { offerElectives, currentForm } = useFormStore();

  // ========== ESTADO LOCAL ==========
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [status, setStatus] = useState<boolean>(false);
  const [selectedElectives, setSelectedElectives] = useState<{
    [programa: string]: string[];
  }>({});
  const [expandedFacultades, setExpandedFacultades] = useState<{
    [key: string]: boolean;
  }>({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // ========== EFECTOS ==========

  useEffect(() => {
    fetchElectives();
    fetchPrograms();
  }, [fetchElectives, fetchPrograms]);

  useEffect(() => {
    if (currentForm) {
      setYear(currentForm.for_year);
      setSemester(currentForm.for_semester as 1 | 2);
      setStatus(currentForm.for_status);
      setSelectedElectives(currentForm.electivesByProgram);
    }
  }, [currentForm]);

  useEffect(() => {
    if (programs.length > 0) {
      const facultades = [
        ...new Set(
          programs
            .filter((program) => program.pro_activo)
            .map((program) => program.fac_nombre)
        ),
      ];

      const initialExpandedState = facultades.reduce((acc, facultad) => {
        acc[facultad] = true;
        return acc;
      }, {} as { [key: string]: boolean });

      setExpandedFacultades(initialExpandedState);
    }
  }, [programs]);

  // ========== ESTRUCTURA DE DATOS ==========

  const facultades = [
    ...new Set(
      programs
        .filter((program) => program.pro_activo)
        .map((program) => program.fac_nombre)
    ),
  ].sort();

  const programasPorFacultad = facultades.reduce((acc, facultad) => {
    const programasDeFacultad = programs
      .filter(
        (program) => program.pro_activo && program.fac_nombre === facultad
      )
      .sort((a, b) => a.pro_nombre.localeCompare(b.pro_nombre));
    acc[facultad] = programasDeFacultad;
    return acc;
  }, {} as { [facultad: string]: any[] });

  const electivasPorPrograma = programs.reduce((acc, program) => {
    const electivasDelPrograma = electives.filter(
      (elective) => elective.active && elective.programa === program.pro_nombre
    );
    acc[program.pro_nombre] = electivasDelPrograma;
    return acc;
  }, {} as { [programa: string]: any[] });

  // ========== MANEJADORES ==========

  const toggleFacultad = (facultad: string) => {
    setExpandedFacultades((prev) => ({
      ...prev,
      [facultad]: !prev[facultad],
    }));
  };

  const handleElectiveSelection = (
    program: string,
    codigo: string,
    isChecked: boolean
  ) => {
    setSelectedElectives((prev) => {
      const programElectives = prev[program] || [];
      return {
        ...prev,
        [program]: isChecked
          ? [...programElectives, codigo]
          : programElectives.filter((id) => id !== codigo),
      };
    });
  };

  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  };

  const hasSelectedElectives = Object.values(selectedElectives).some(
    (electives) => electives.length > 0
  );

  const handleSave = () => {
    if (!hasSelectedElectives) {
      setWarning({ open: true, message: "Selecciona al menos una electiva." });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    const formConfig: Offer = {
      for_year: year,
      for_semester: semester,
      for_status: status,
      electivesByProgram: selectedElectives,
    };

    try {
      await offerElectives(formConfig);
      setShowSuccess(true);
    } catch (error) {
      setWarning({
        message: "Error al guardar. Revisa la configuración.",
        open: true,
      });
    }
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="offer-container">
      <Header />
      <Navbar />

      <div className="offer-content">
        <div style={{ maxWidth: "1000px", width: "100%" }}>
          <Card className="offer-card" padding="xl">
            <h2 className="offer-title">
              Configuración de Oferta de Electivas
            </h2>

            {/* Panel de Configuración */}
            <div className="offer-config-panel">
              <div className="offer-config-item">
                <span className="offer-config-label">Año:</span>
                <Select value={year} onChange={setYear} style={{ width: 100 }}>
                  {getYearOptions().map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="offer-config-item">
                <span className="offer-config-label">Semestre:</span>
                <Select
                  value={semester}
                  onChange={setSemester}
                  style={{ width: 80 }}
                >
                  <Option value={1}>1</Option>
                  <Option value={2}>2</Option>
                </Select>
              </div>

              <div className="offer-config-item">
                <span className="offer-config-label">Estado:</span>
                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ width: 140 }}
                >
                  <Option value={true}>Habilitado</Option>
                  <Option value={false}>Deshabilitado</Option>
                </Select>
              </div>
            </div>

            {/* SECCIONES POR FACULTAD */}
            <div>
              {facultades.map((facultad) => {
                const programasDeEstaFacultad = programasPorFacultad[facultad];
                const isExpanded = expandedFacultades[facultad];

                return (
                  <div key={facultad} className="offer-facultad-container">
                    {/* HEADER DESPLEGABLE */}
                    <div
                      className="offer-facultad-header"
                      onClick={() => toggleFacultad(facultad)}
                    >
                      <h3 className="offer-facultad-title">
                        {facultad}
                        <span className="offer-facultad-count">
                          ({programasDeEstaFacultad.length} programa
                          {programasDeEstaFacultad.length !== 1 ? "s" : ""})
                        </span>
                      </h3>
                      <span
                        className={`offer-facultad-arrow ${
                          isExpanded ? "expanded" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>

                    {/* CONTENIDO DESPLEGABLE */}
                    {isExpanded && (
                      <div className="offer-facultad-content">
                        {programasDeEstaFacultad.length === 0 ? (
                          <div className="offer-empty-message">
                            No hay programas asociados a esta facultad
                          </div>
                        ) : (
                          <div className="offer-programas-grid">
                            {programasDeEstaFacultad.map((programa) => {
                              const electivasDeEstePrograma =
                                electivasPorPrograma[programa.nombre] || [];

                              return (
                                <div
                                  key={programa.codigo}
                                  className="offer-programa-card"
                                >
                                  {/* HEADER DEL PROGRAMA */}
                                  <div className="offer-programa-header">
                                    <div className="offer-programa-info">
                                      <h4 className="offer-programa-name">
                                        {programa.nombre}
                                      </h4>
                                      <div className="offer-programa-code">
                                        Código: {programa.codigo}
                                      </div>
                                    </div>
                                    <div className="offer-programa-count">
                                      {selectedElectives[programa.nombre]
                                        ?.length || 0}{" "}
                                      seleccionadas
                                    </div>
                                  </div>

                                  {/* ELECTIVAS DEL PROGRAMA */}
                                  <div className="offer-electivas-list">
                                    {electivasDeEstePrograma.length === 0 ? (
                                      <div className="offer-empty-program">
                                        No hay electivas activas
                                      </div>
                                    ) : (
                                      electivasDeEstePrograma.map(
                                        (elective) => (
                                          <label
                                            key={elective.codigo}
                                            className={`offer-electiva-item ${
                                              selectedElectives[
                                                programa.nombre
                                              ]?.includes(elective.codigo)
                                                ? "selected"
                                                : ""
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              className="offer-electiva-checkbox"
                                              checked={
                                                selectedElectives[
                                                  programa.nombre
                                                ]?.includes(elective.codigo) ||
                                                false
                                              }
                                              onChange={(e) =>
                                                handleElectiveSelection(
                                                  programa.nombre,
                                                  elective.codigo,
                                                  e.target.checked
                                                )
                                              }
                                            />
                                            <span className="offer-electiva-name">
                                              {elective.nombre}
                                            </span>
                                            <span className="offer-electiva-code">
                                              {elective.codigo}
                                            </span>
                                          </label>
                                        )
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón Guardar */}
            <div className="offer-save-button">
              <Button
                variant="primary"
                size="medium"
                onClick={handleSave}
                disabled={!hasSelectedElectives}
              >
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />

      <ConfirmModal
        open={showConfirm}
        message={`¿Estás seguro de guardar la oferta para el período ${year}-${semester}?`}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />

      <SuccessModal
        open={showSuccess}
        message={`Oferta ${year}-${semester} guardada exitosamente.`}
        onClose={() => setShowSuccess(false)}
      />

      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />
    </div>
  );
};

export default Oferta;
