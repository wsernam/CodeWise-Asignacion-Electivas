// screens/student/ElectiveSelection.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
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
import { useStudentStore } from "../../store/studentStore";
import type { IStudent } from "../../models/student";

const { Option } = Select;

const ElectiveSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeElectives, fetchActiveElectives, addStudent, loading } =
    useStudentStore();

  const studentData = location.state as Omit<IStudent, "electivas">;

  const [selectedElectives, setSelectedElectives] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  useEffect(() => {
    if (studentData?.programa) {
      fetchActiveElectives(studentData.programa);
    } else {
      navigate("/personal-info");
    }
  }, [studentData, fetchActiveElectives, navigate]);

  const handleElectiveChange = (index: number, value: string) => {
    const newElectives = [...selectedElectives];
    newElectives[index] = value;
    setSelectedElectives(newElectives);
  };

  const hasDuplicateElectives = () => {
    const nonEmptyElectives = selectedElectives.filter((e) => e !== "");
    return new Set(nonEmptyElectives).size !== nonEmptyElectives.length;
  };

  const handleSubmit = () => {
    if (selectedElectives.some((elective) => elective === "")) {
      setWarning({
        open: true,
        message: "Debes seleccionar 5 electivas en orden de prioridad.",
      });
      return;
    }

    if (hasDuplicateElectives()) {
      setWarning({
        open: true,
        message: "No puedes seleccionar la misma electiva más de una vez.",
      });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);

    const student: IStudent = {
      ...studentData,
      electivas: selectedElectives,
    };

    try {
      await addStudent(student);
      setShowSuccess(true);
    } catch (error: any) {
      if (error.message === "EXISTS_ACTIVE") {
        setWarning({
          open: true,
          message: `Ya existe un estudiante registrado con el código ${studentData.codigo}.`,
        });
      } else if (error.message === "INVALID_ELECTIVES") {
        setWarning({
          open: true,
          message: `Error en las electivas seleccionadas: ${error.details?.join(
            ", "
          )}`,
        });
      } else {
        setWarning({
          open: true,
          message: "Error al registrar. Por favor intenta nuevamente.",
        });
      }
    }
  };

  const handleBack = () => {
    navigate("/personal-info");
  };

  if (!studentData) {
    return null;
  }

  return (
    <div className="form-page-container">
      <Header />

      <div className="form-page-content">
        <div style={{ maxWidth: "800px", width: "100%" }}>
          <Card className="form-card" padding="xl">
            <h2 className="form-title">Selección de Electivas</h2>

            {/* Información del Estudiante */}
            <div
              style={{
                background: "var(--gray-light)",
                padding: "var(--space-md)",
                borderRadius: "8px",
                marginBottom: "var(--space-xl)",
              }}
            >
              <h3
                style={{
                  marginBottom: "var(--space-sm)",
                  color: "var(--primary-blue)",
                }}
              >
                Información del Estudiante
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-sm)",
                }}
              >
                <div>
                  <strong>Código:</strong> {studentData.codigo}
                </div>
                <div>
                  <strong>Nombre:</strong> {studentData.nombre}{" "}
                  {studentData.apellido}
                </div>
                <div>
                  <strong>Email:</strong> {studentData.email}
                </div>
                <div>
                  <strong>Programa:</strong> {studentData.programa}
                </div>
              </div>
            </div>

            {/* Selección de Electivas */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <label style={{ minWidth: "120px", fontWeight: 600 }}>
                    Electiva {index + 1}:
                  </label>
                  <Select
                    value={selectedElectives[index]}
                    onChange={(value) => handleElectiveChange(index, value)}
                    placeholder={`Selecciona electiva ${index + 1}`}
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    <Option value="">Selecciona una electiva</Option>
                    {activeElectives.map((elective) => (
                      <Option
                        key={elective.ele_codigo}
                        value={elective.ele_codigo}
                        disabled={
                          selectedElectives.includes(elective.ele_codigo) &&
                          selectedElectives[index] !== elective.ele_codigo
                        }
                      >
                        {elective.ele_nombre} ({elective.ele_codigo})
                      </Option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>

            {/* Contador y Advertencias */}
            <div style={{ marginTop: "var(--space-lg)" }}>
              <p
                style={{
                  color: "var(--gray-dark)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <strong>Electivas seleccionadas:</strong>{" "}
                {selectedElectives.filter((e) => e !== "").length} de 5
              </p>
              {hasDuplicateElectives() && (
                <p style={{ color: "var(--primary-red)", fontSize: "0.9rem" }}>
                  ⚠️ Tienes electivas duplicadas. Por favor selecciona electivas
                  diferentes.
                </p>
              )}
            </div>

            {/* Botones de Acción - Mismos colores que Offer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "var(--space-xl)",
                gap: "var(--space-md)",
              }}
            >
              {/* Botón Volver - Color secundario (gris) como en Offer */}
              <Button variant="primary" onClick={handleBack} disabled={loading}>
                Volver
              </Button>

              {/* Botón Finalizar - Color primario (azul) como en Offer */}
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={
                  selectedElectives.some((e) => e === "") ||
                  hasDuplicateElectives()
                }
              >
                {loading ? "Registrando..." : "Finalizar Registro"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />

      {/* Modal de Confirmación */}
      <ConfirmModal
        open={showConfirm}
        message="¿Estás seguro de registrar tu selección de electivas? Esta acción no se puede deshacer."
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        open={showSuccess}
        message="¡Registro completado exitosamente! Tu selección de electivas ha sido guardada."
        onClose={() => {
          setShowSuccess(false);
          navigate("/");
        }}
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

export default ElectiveSelection;
