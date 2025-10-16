// screens/student/PersonalInfo.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Select } from "antd";

// Components
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
// Stores
import { useProgramStore } from "../../store/programStore";

const { Option } = Select;

const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const { programs, fetchPrograms } = useProgramStore();

  const [formData, setFormData] = useState({
    codigo: "",
    email: "",
    nombre: "",
    apellido: "",
    programa: "",
  });

  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validaciones como en AddElective
  const validateCodigo = (value: string) => {
    if (!value) return "Por favor ingresa el código";
    if (!/^\d+$/.test(value)) return "El código debe contener solo números";
    if (value.length !== 12)
      return "El código debe tener exactamente 12 dígitos";
    return null;
  };

  const validateNombre = (value: string) => {
    if (!value) return "Por favor ingresa el nombre";
    if (value.length < 3) return "El nombre debe tener al menos 3 caracteres";
    if (value.length > 100) return "El nombre no puede exceder 100 caracteres";
    if (/^\s+|\s+$/.test(value))
      return "El nombre no puede empezar o terminar con espacios";
    if (/\d/.test(value)) return "El nombre no puede contener números";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
      return "El nombre solo puede contener letras y espacios";
    return null;
  };

  const validateEmail = (value: string) => {
    if (!value) return "Por favor ingresa el email";
    if (!value.endsWith("@unicauca.edu.co"))
      return "El email debe ser @unicauca.edu.co";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Por favor ingresa un email válido";
    return null;
  };

  const handleNext = () => {
    // Validar todos los campos
    const codigoError = validateCodigo(formData.codigo);
    const nombreError = validateNombre(formData.nombre);
    const apellidoError = validateNombre(formData.apellido);
    const emailError = validateEmail(formData.email);
    const programaError = !formData.programa
      ? "Por favor selecciona tu programa"
      : null;

    const errors = [
      codigoError,
      nombreError,
      apellidoError,
      emailError,
      programaError,
    ].filter(Boolean);

    if (errors.length > 0) {
      setWarning({ open: true, message: errors.join(". ") });
      return;
    }

    // Si todo está bien, navegar
    navigate("/elective-selection", { state: formData });
  };

  return (
    <div className="form-page-container">
      <Header />

      <div className="form-page-content">
        <div style={{ maxWidth: "600px", width: "100%" }}>
          <Card className="form-card" padding="xl">
            <h2 className="form-title">Información Personal</h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-lg)",
              }}
            >
              {/* Código - Solo números, 12 dígitos */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "var(--space-sm)",
                    fontWeight: 600,
                  }}
                >
                  Código de Estudiante *
                </label>
                <input
                  type="text"
                  placeholder="123456789012 (12 dígitos)"
                  value={formData.codigo}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 12);
                    handleInputChange("codigo", value);
                  }}
                  style={{
                    width: "100%",
                    padding: "var(--space-md)",
                    border: "1px solid var(--gray-medium)",
                    borderRadius: "4px",
                  }}
                />
                {formData.codigo && validateCodigo(formData.codigo) && (
                  <span
                    style={{ color: "var(--primary-red)", fontSize: "0.8rem" }}
                  >
                    {validateCodigo(formData.codigo)}
                  </span>
                )}
              </div>

              {/* Email - Solo @unicauca.edu.co */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "var(--space-sm)",
                    fontWeight: 600,
                  }}
                >
                  Email Institucional *
                </label>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <input
                    type="text"
                    placeholder="usuario"
                    value={formData.email.replace("@unicauca.edu.co", "")}
                    onChange={(e) => {
                      const user = e.target.value;
                      handleInputChange(
                        "email",
                        user ? `${user}@unicauca.edu.co` : ""
                      );
                    }}
                    style={{
                      flex: 1,
                      padding: "var(--space-md)",
                      border: "1px solid var(--gray-medium)",
                      borderRadius: "4px",
                    }}
                  />
                  <span
                    style={{
                      padding: "var(--space-md)",
                      background: "var(--gray-light)",
                      border: "1px solid var(--gray-medium)",
                      borderRadius: "4px",
                      color: "var(--gray-dark)",
                    }}
                  >
                    @unicauca.edu.co
                  </span>
                </div>
                {formData.email && validateEmail(formData.email) && (
                  <span
                    style={{ color: "var(--primary-red)", fontSize: "0.8rem" }}
                  >
                    {validateEmail(formData.email)}
                  </span>
                )}
              </div>

              {/* Nombre y Apellido */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-md)",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "var(--space-sm)",
                      fontWeight: 600,
                    }}
                  >
                    Nombres *
                  </label>
                  <input
                    type="text"
                    placeholder="Tus nombres"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "var(--space-md)",
                      border: "1px solid var(--gray-medium)",
                      borderRadius: "4px",
                    }}
                  />
                  {formData.nombre && validateNombre(formData.nombre) && (
                    <span
                      style={{
                        color: "var(--primary-red)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {validateNombre(formData.nombre)}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "var(--space-sm)",
                      fontWeight: 600,
                    }}
                  >
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    placeholder="Tus apellidos"
                    value={formData.apellido}
                    onChange={(e) =>
                      handleInputChange("apellido", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "var(--space-md)",
                      border: "1px solid var(--gray-medium)",
                      borderRadius: "4px",
                    }}
                  />
                  {formData.apellido && validateNombre(formData.apellido) && (
                    <span
                      style={{
                        color: "var(--primary-red)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {validateNombre(formData.apellido)}
                    </span>
                  )}
                </div>
              </div>

              {/* Programa - Traído del store de programas */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "var(--space-sm)",
                    fontWeight: 600,
                  }}
                >
                  Programa Académico *
                </label>
                <Select
                  value={formData.programa}
                  onChange={(value) => handleInputChange("programa", value)}
                  placeholder="Selecciona tu programa"
                  style={{ width: "100%" }}
                  size="large"
                >
                  {programs
                    .filter((program) => program.pro_activo)
                    .map((program) => (
                      <Option
                        key={program.pro_codigo}
                        value={program.pro_codigo}
                      >
                        {program.pro_nombre}
                      </Option>
                    ))}
                </Select>
                {!formData.programa && (
                  <span
                    style={{ color: "var(--primary-red)", fontSize: "0.8rem" }}
                  >
                    Por favor selecciona tu programa
                  </span>
                )}
              </div>
            </div>

            {/* Botón Siguiente - Color primario como en Offer */}
            <div style={{ textAlign: "center", marginTop: "var(--space-xl)" }}>
              <Button
                variant="primary"
                size="medium"
                onClick={handleNext}
                disabled={
                  !formData.codigo ||
                  !formData.email ||
                  !formData.nombre ||
                  !formData.apellido ||
                  !formData.programa
                }
              >
                Siguiente
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />

      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />
    </div>
  );
};

export default PersonalInfo;
