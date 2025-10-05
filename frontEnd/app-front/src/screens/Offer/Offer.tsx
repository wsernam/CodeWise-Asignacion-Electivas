import React, { useState, useEffect } from "react";
import { Select } from "antd";

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
import { useFormStore } from "../../store/offerStore";
import type { IOffer as Offer } from "../../models/offer";

const { Option } = Select;

const Oferta: React.FC = () => {
  // ========== STORES ==========
  const { electives, fetchElectives } = useElectiveStore();
  const { offerElectives, currentForm } = useFormStore();

  // ========== ESTADO LOCAL ==========
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [status, setStatus] = useState<boolean>(false);
  const [selectedElectives, setSelectedElectives] = useState<{
    [programa: string]: string[];
  }>({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // ← ESTADO PARA ÉXITO
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // ========== EFECTOS ==========

  // Cargar electivas al inicio
  useEffect(() => {
    fetchElectives();
  }, [fetchElectives]);

  // Cargar configuración existente si hay
  useEffect(() => {
    if (currentForm) {
      setYear(currentForm.for_year);
      setSemester(currentForm.for_semester as 1 | 2);
      setStatus(currentForm.for_status);
      setSelectedElectives(currentForm.electivesByProgram);
    }
  }, [currentForm]);

  // ========== FUNCIONES AUXILIARES ==========

  /**
   * Genera lista de años para el dropdown
   */
  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  };

  /**
   * Agrupa electivas por programa
   */
  const electivesByProgram = electives.reduce((acc: any, elective) => {
    const program = elective.programa || "Sin programa";
    if (!acc[program]) acc[program] = [];
    acc[program].push(elective);
    return acc;
  }, {});

  /**
   * Verifica si hay electivas seleccionadas
   */
  const hasSelectedElectives = Object.values(selectedElectives).some(
    (electives) => electives.length > 0
  );

  // ========== MANEJADORES ==========

  /**
   * Maneja el cambio de selección de electivas
   */
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

  /**
   * Valida el formulario antes de mostrar confirmación
   */
  const handleSave = () => {
    if (!hasSelectedElectives) {
      setWarning({ open: true, message: "Selecciona al menos una electiva." });
      return;
    }
    setShowConfirm(true);
  };

  /**
   * Ejecuta el guardado después de la confirmación
   */
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
      setShowSuccess(true); // ← CORREGIDO: Usar showSuccess en lugar de showConfirm
    } catch (error) {
      setWarning({
        open: true,
        message: "Error al guardar. Revisa la configuración.",
      });
    }
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="form-page-container">
      <Header />
      <Navbar />

      <div className="form-page-content">
        <div style={{ maxWidth: "900px", width: "100%" }}>
          <Card className="form-card" padding="xl">
            <h2 className="form-title">Configuración de Oferta de Electivas</h2>

            {/* Panel de Configuración */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xl)",
                marginBottom: "var(--space-xl)",
                padding: "var(--space-md)",
                background: "var(--gray-light)",
                borderRadius: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Año */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span style={{ fontWeight: 600 }}>Año:</span>
                <Select value={year} onChange={setYear} style={{ width: 100 }}>
                  {getYearOptions().map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Semestre */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span style={{ fontWeight: 600 }}>Semestre:</span>
                <Select
                  value={semester}
                  onChange={setSemester}
                  style={{ width: 80 }}
                >
                  <Option value={1}>1</Option>
                  <Option value={2}>2</Option>
                </Select>
              </div>

              {/* Estado */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span style={{ fontWeight: 600 }}>Estado:</span>
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

            {/* Lista de Electivas por Programa */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--space-lg)",
                marginBottom: "var(--space-xl)",
              }}
            >
              {Object.entries(electivesByProgram).map(
                ([program, electivesList]) => (
                  <div
                    key={program}
                    style={{
                      background: "var(--gray-light)",
                      border: "1px solid var(--gray-medium)",
                      borderRadius: "8px",
                      padding: "var(--space-md)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "var(--space-md)",
                        paddingBottom: "var(--space-sm)",
                        borderBottom: "1px solid var(--gray-medium)",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                        {program}
                      </h3>
                      <span
                        style={{
                          color: "var(--primary-blue)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {selectedElectives[program]?.length || 0} seleccionadas
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-sm)",
                      }}
                    >
                      {(electivesList as any[]).map((elective) => (
                        <label
                          key={elective.codigo}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-sm)",
                            padding: "var(--space-sm)",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedElectives[program]?.includes(
                                elective.codigo
                              ) || false
                            }
                            onChange={(e) =>
                              handleElectiveSelection(
                                program,
                                elective.codigo,
                                e.target.checked
                              )
                            }
                          />
                          <span style={{ flex: 1 }}>{elective.nombre}</span>
                          <span
                            style={{
                              color: "var(--gray-dark)",
                              fontSize: "0.85rem",
                            }}
                          >
                            ({elective.codigo})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Botón Guardar */}
            <div style={{ textAlign: "center" }}>
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

      {/* Modal de Confirmación */}
      <ConfirmModal
        open={showConfirm}
        message={`¿Estás seguro de guardar la configuración para el período ${year}-${semester}?`}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        open={showSuccess}
        message={`Configuración ${year}-${semester} guardada exitosamente.`}
        onClose={() => setShowSuccess(false)}
      />

      {/* Modal de Advertencia */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />
    </div>
  );
};

export default Oferta;
