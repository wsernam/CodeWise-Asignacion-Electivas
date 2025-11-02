import React, { useState, useEffect } from "react";
import { Select } from "antd";
import "./Offer.css";

// Components
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";

// Stores
import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore";
import type { IOffer } from "../../models/offer";
import { useOfferStore } from "../../store/offerStore";
import { useFormStatusStore } from "../../store/formStatusStore";

const { Option } = Select;

const Offer: React.FC = () => {
  // ========== STORES ==========
  const { electives, fetchElectives } = useElectiveStore();
  const { programs, fetchPrograms } = useProgramStore();
  const { createBulkOffer } = useOfferStore();
  const { formStatus } = useFormStatusStore();

  // ========== ESTADO LOCAL ==========
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [selectedElectives, setSelectedElectives] = useState<{
    [programa: string]: string[];
  }>({});
  const [expandedFacultades, setExpandedFacultades] = useState<{
    [key: string]: boolean;
  }>({});
  const [program, setProgram] = useState<string>("");

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

  // Filtrar programas que tienen electivas activas
  const programasConElectivasActivas = programs.filter((program) => {
    const electivasDelPrograma = electives.filter(
      (elective) =>
        elective.ele_estado &&
        elective.pro_codigo.toString() === program.pro_codigo.toString()
    );
    return electivasDelPrograma.length > 0;
  });

  // Agrupar programas por facultad
  const programasPorFacultad = facultades.reduce((acc, facultad) => {
    const programasDeFacultad = programs
      .filter(
        (program) =>
          program.pro_activo &&
          program.fac_nombre === facultad &&
          programasConElectivasActivas.some(
            (p) => p.pro_codigo === program.pro_codigo
          )
      )
      .sort((a, b) => a.pro_nombre.localeCompare(b.pro_nombre));
    acc[facultad] = programasDeFacultad;
    return acc;
  }, {} as { [facultad: string]: any[] });

  const electivasPorPrograma = programs.reduce((acc, program) => {
    const electivasDelPrograma = electives.filter(
      (elective) =>
        elective.ele_estado &&
        elective.pro_codigo.toString() === program.pro_codigo.toString()
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
    if (!program) {
      setWarning({
        open: true,
        message: "Selecciona un programa para la oferta.",
      });
      return;
    }

    setShowConfirm(true);
  };

  // Modificar las funciones de manejo
  const handleConfirmSave = async () => {
    setShowConfirm(false);
    try {
      if (!program) {
        setWarning({
          open: true,
          message: "Selecciona un programa para crear la oferta.",
        });
        return;
      }

      // Construir la oferta con el programa seleccionado
      const oferta = Object.values(selectedElectives)
        .flat()
        .map((ele_codigo) => ({
          ele_codigo,
          pro_codigo: program, //  código seleccionado en el Select
        }));

      if (oferta.length === 0) {
        setWarning({
          open: true,
          message: "No se seleccionaron electivas para ofertar.",
        });
        return;
      }

      const bulkData: IOffer = {
        ofe_anio: year,
        ofe_num_semestre: semester,
        ofertas: oferta,
      };

      console.log("[FRONT] Enviando oferta:", bulkData);

      await createBulkOffer(bulkData);

      setShowSuccess(true);
    } catch (error) {
      console.error("[Offer] Error al guardar oferta:", error);
      setWarning({
        message: "Error al guardar la oferta. Revisa la configuración.",
        open: true,
      });
    }
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="offer-container">
      <div className="offer-content">
        <div style={{ maxWidth: "1000px", width: "100%" }}>
          <Card className="offer-card" padding="xl">
            {formStatus && (
              <div className="offer-blocking-overlay">
                <div className="offer-blocking-message">
                  <div className="offer-blocking-icon">🔒</div>
                  <h3>Formulario en Modo Activo</h3>
                  <p>
                    No se pueden realizar modificaciones mientras el formulario
                    esté activo para los estudiantes.
                  </p>
                  <p>
                    Desactiva el formulario desde el Inicio para habilitar
                    ediciones.
                  </p>
                </div>
              </div>
            )}

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

              <div className="offer-config-program">
                <span className="offer-config-progra">Programa:</span>
                <Select
                  value={program}
                  onChange={(value: string) => setProgram(value)}
                  style={{ width: 320 }}
                  placeholder="Selecciona el programa para el cual se va a crear la oferta"
                >
                  {programs.map((p) => (
                    <Option key={p.pro_codigo} value={p.pro_codigo.toString()}>
                      {p.pro_nombre} ({p.pro_codigo})
                    </Option>
                  ))}
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
                                electivasPorPrograma[programa.pro_nombre] || [];

                              return (
                                <div
                                  key={programa.pro_codigo}
                                  className="offer-programa-card"
                                >
                                  {/* HEADER DEL PROGRAMA */}
                                  <div className="offer-programa-header">
                                    <div className="offer-programa-info">
                                      <h4 className="offer-programa-name">
                                        {programa.pro_nombre}
                                      </h4>
                                      <div className="offer-programa-code">
                                        Código: {programa.pro_codigo}
                                      </div>
                                    </div>
                                    <div className="offer-programa-count">
                                      {selectedElectives[programa.pro_nombre]
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
                                            key={elective.ele_codigo}
                                            className={`offer-electiva-item ${
                                              selectedElectives[
                                                programa.pro_nombre
                                              ]?.includes(elective.ele_codigo)
                                                ? "selected"
                                                : ""
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              className="offer-electiva-checkbox"
                                              checked={
                                                selectedElectives[
                                                  programa.pro_nombre
                                                ]?.includes(
                                                  elective.ele_codigo
                                                ) || false
                                              }
                                              onChange={(e) =>
                                                handleElectiveSelection(
                                                  programa.pro_nombre,
                                                  elective.ele_codigo,
                                                  e.target.checked
                                                )
                                              }
                                            />
                                            <span className="offer-electiva-name">
                                              {elective.ele_nombre}
                                            </span>
                                            <span className="offer-electiva-code">
                                              {elective.ele_codigo}
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
                disabled={!hasSelectedElectives || formStatus}
              >
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      </div>

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

export default Offer;
