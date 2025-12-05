import React, { useState, useEffect } from "react";
import { Form, Row, Col, Select } from "antd";
import "../../AssignmentModule.css";
import WarningModal from "../../../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../../components/shared/SuccessModal/SuccessModal";
import Button from "../../../../components/ui/Button/Button";
import { useAssignmentProcessStore } from "../../../../store/Assignment";
import { useAssignmentFlowStore } from "../../../../store/Assignment";

type AssignmentProcessProps = {
  onNext: (year: number, semester: 1 | 2) => void;
  onCancel: () => void;
};

const CreateAssignmentProcess: React.FC<AssignmentProcessProps> = ({
  onNext,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<1 | 2 | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const { crearProceso, verificarCondicionesCreacion, loading, clearError } =
    useAssignmentProcessStore();
  const { setCurrentStep, addCompletedStep } = useAssignmentFlowStore();

  useEffect(() => {
    const isValid = !!year && !!semester;
    setIsFormValid(isValid);
  }, [year, semester]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  };

  const handleSave = async () => {
    if (!isFormValid) {
      setWarning({
        open: true,
        message:
          "Por favor complete todos los campos obligatorios del formulario.",
      });
      return;
    }

    try {
      // Validar condiciones antes de mostrar confirmación
      const validacion = await verificarCondicionesCreacion(year!, semester!);

      if (!validacion.puedeCrear) {
        // Mostrar todas las razones en un solo mensaje
        const mensajeError = validacion.razones.join("\n• ");
        setWarning({
          open: true,
          message: `No se puede crear el proceso porque:\n ${mensajeError}`,
        });
        return;
      }
      setShowConfirm(true);
    } catch (error: any) {
      console.error("[CreateProcess] Error en validación:", error);
      setWarning({
        open: true,
        message: "Error al verificar las condiciones. Intente nuevamente.",
      });
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);

    if (!year || !semester) return;

    try {
      console.log(`[CreateProcess] Creando proceso ${year}-${semester}...`);
      const proceso = await crearProceso(year, semester);
      console.log("[CreateProcess] Proceso creado exitosamente:", proceso);

      // Actualizar estado de flujo
      setCurrentStep(1);
      addCompletedStep(0);
      setShowSuccess(true);

      // Notifica al componente padre
      if (onNext) {
        onNext(year, semester);
      }
    } catch (error: any) {
      console.error("[CreateProcess] Error creando proceso:", error);

      // Manejo de errores específicos
      const message = error.message || "";

      if (message.includes("must make a unique set")) {
        // Ya existe para ese año/semestre
        setWarning({
          open: true,
          message: `Ya existe un proceso de asignación para el periodo ${year}-${semester}.`,
        });
      } else if (
        message.includes("proceso activo") ||
        message.includes("activo")
      ) {
        // Ya hay un proceso activo (independiente del año/semestre)
        setWarning({
          open: true,
          message:
            "Ya existe un proceso de asignación Activo. Debe finalizar el proceso actual antes de crear uno nuevo.",
        });
      } else {
        setWarning({
          open: true,
          message:
            "Error al crear el proceso de asignación. Por favor, intente nuevamente.",
        });
      }
    }
  };

  return (
    <>
      <div className="create-assignment-form-container">
        <div className="form-section-title">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Año de Asignación"
                  name="assignmentYear"
                  rules={[
                    {
                      required: true,
                      message: "Por favor seleccione el año de asignación.",
                    },
                  ]}
                >
                  <Select
                    value={year}
                    placeholder="Seleccione un año"
                    onChange={setYear}
                    options={getYearOptions().map((y) => ({
                      label: y,
                      value: y,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Semestre de Asignación"
                  name="assignmentSemester"
                  rules={[
                    {
                      required: true,
                      message:
                        "Por favor seleccione el semestre de asignación.",
                    },
                  ]}
                >
                  <Select
                    value={semester}
                    placeholder="Seleccione un semestre"
                    onChange={setSemester}
                    options={[
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        {/* Mostrar estado de carga y error */}
        {loading && <p>Creando proceso de asignación...</p>}

        <div
          className="form-create-actions"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Button
            variant="secondary"
            onClick={onCancel}
            className="btn-cancel-assignment-process"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="btn-save-assignment-process"
            disabled={loading}
          >
            {loading ? "Creando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        message={`¿Estás seguro de crear el proceso de asignación para el periodo ${year}-${semester}?`}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />

      <SuccessModal
        open={showSuccess}
        message={`Proceso de asignación ${year}-${semester} creado exitosamente.`}
        onClose={() => {
          setShowSuccess(false);
        }}
      />

      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />
    </>
  );
};

export default CreateAssignmentProcess;
