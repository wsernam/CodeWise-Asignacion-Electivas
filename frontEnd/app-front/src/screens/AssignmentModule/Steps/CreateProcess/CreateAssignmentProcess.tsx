import React, { useState, useEffect } from "react";
import { Form, Row, Col, Select } from "antd";
import "../../AssignmentModule.css";
import WarningModal from "../../../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../../components/shared/SuccessModal/SuccessModal";
import Button from "../../../../components/ui/Button/Button";

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

  useEffect(() => {
    const isValid = !!year && !!semester;
    setIsFormValid(isValid);
  }, [year, semester]);

  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  };

  const handleSave = () => {
    if (!isFormValid) {
      setWarning({
        open: true,
        message:
          "Por favor complete todos los campos obligatorios del formulario.",
      });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    try {
      setShowSuccess(true);
      // Pasar los datos del proceso creado
      if (onNext && year && semester) {
        onNext(year, semester);
      }
    } catch (error) {
      console.error("Error al crear el proceso de asignación:", error);
      setWarning({
        open: true,
        message:
          "Ocurrió un error al crear el proceso de asignación. Por favor, intente nuevamente.",
      });
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
        <div className="form-create-actions">
          <Button
            variant="primary"
            onClick={handleSave}
            className="btn-save-assignment-process"
          >
            Guardar
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            className="btn-cancel-assignment-process"
          >
            Cancelar
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
