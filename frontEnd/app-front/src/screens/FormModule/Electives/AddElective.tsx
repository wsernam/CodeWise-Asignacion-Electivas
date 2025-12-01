import React, { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import { useNavigate } from "react-router";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import { useElectiveStore } from "../../../store/Form/electiveStore";
import { useProgramStore } from "../../../store/Form/programStore";
import type { IElective } from "../../../models/Form/elective";

const { Option } = Select;

const AddElective: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const formValues = Form.useWatch([], form);

  const [touchedFields, setTouchedFields] = useState({
    ele_codigo: false,
    ele_nombre: false,
    pro_codigo: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [confirm, setConfirm] = useState<{
    open: boolean;
    ele_codigo: string;
    ele_nombre: string;
  }>({
    open: false,
    ele_codigo: "",
    ele_nombre: "",
  });
  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Stores
  const addElective = useElectiveStore((s) => s.addElective);
  const reactivateElective = useElectiveStore((s) => s.reactivateElective);
  const programs = useProgramStore((s) => s.programs);
  const fetchPrograms = useProgramStore((s) => s.fetchPrograms);

  useEffect(() => {
    if (programs.length === 0) fetchPrograms();
  }, [fetchPrograms, programs.length]);

  // ===== Validaciones =====
  const validateEleCodigo = (_: any, value: string) => {
    if (!value) return Promise.reject("Por favor ingresa el código");
    if (value.length < 2 || value.length > 10)
      return Promise.reject("El código debe tener entre 2 y 10 caracteres");
    if (!/[a-zA-Z]/.test(value))
      return Promise.reject("El código debe contener al menos una letra");
    if (!/\d/.test(value))
      return Promise.reject("El código debe contener al menos un número");
    if (!/^[a-zA-Z0-9]+$/.test(value))
      return Promise.reject("El código solo puede contener letras y números");
    return Promise.resolve();
  };

  const validateEleNombre = (_: any, value: string) => {
    if (!value) return Promise.reject("Por favor ingresa el nombre");
    if (value.length < 3)
      return Promise.reject("El nombre debe tener al menos 3 caracteres");
    if (value.length > 100)
      return Promise.reject("El nombre no puede exceder 100 caracteres");
    if (/^\s+|\s+$/.test(value))
      return Promise.reject(
        "El nombre no puede empezar o terminar con espacios"
      );
    if (/\d/.test(value))
      return Promise.reject("El nombre no puede contener números");
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
      return Promise.reject("El nombre solo puede contener letras y espacios");
    return Promise.resolve();
  };

  const handleFieldTouch = (field: keyof typeof touchedFields) =>
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

  useEffect(() => {
    const checkValidity = async () => {
      try {
        await form.validateFields();
        setIsFormValid(true);
      } catch {
        setIsFormValid(false);
      }
    };
    if (
      touchedFields.ele_codigo ||
      touchedFields.ele_nombre ||
      touchedFields.pro_codigo
    ) {
      checkValidity();
    }
  }, [form, formValues, touchedFields]);

  // ===== Submit =====
  const onFinish = async (values: IElective) => {
    try {
      const payload: IElective = {
        ele_codigo: values.ele_codigo.toUpperCase(),
        ele_nombre: values.ele_nombre.trim().replace(/\s+/g, " "),
        pro_codigo: values.pro_codigo,
        ele_estado: true,
      };

      await addElective(payload);

      setSuccess({
        open: true,
        message: `Electiva "${payload.ele_nombre}" agregada correctamente`,
      });
    } catch (err: any) {
      // Estructura de error esperada del store:
      // { message: "EXISTS_INACTIVE"|"EXISTS_ACTIVE"|..., existing: { ele_codigo, ele_nombre } }
      if (err?.message === "EXISTS_INACTIVE" && err?.existing) {
        setWarning({
          open: true,
          message: `Ya existe la electiva "${err.existing.ele_nombre}" con el código "${err.existing.ele_codigo}" pero está inactiva.`,
        });
        setConfirm({
          open: true,
          ele_codigo: err.existing.ele_codigo,
          ele_nombre: err.existing.ele_nombre,
        });
      } else if (err?.message === "EXISTS_ACTIVE" && err?.existing) {
        setWarning({
          open: true,
          message: `Ya existe una electiva activa con el código "${err.existing.ele_codigo}" o nombre "${err.existing.ele_nombre}"`,
        });
      } else {
        setWarning({
          open: true,
          message: "Error inesperado al agregar la electiva",
        });
      }
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateElective(confirm.ele_codigo);
      setSuccess({
        open: true,
        message: `Electiva "${confirm.ele_nombre}" reactivada correctamente`,
      });
      setConfirm({ open: false, ele_codigo: "", ele_nombre: "" });
      setWarning({ open: false, message: "" });
    } catch {
      setWarning({ open: true, message: "Error al reactivar la electiva" });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
    form.resetFields();
    setTouchedFields({
      ele_codigo: false,
      ele_nombre: false,
      pro_codigo: false,
    });
    navigate("/electives");
  };

  const handleWarningClose = () => setWarning({ open: false, message: "" });
  const handleConfirmCancel = () => {
    setConfirm({ open: false, ele_codigo: "", ele_nombre: "" });
    setWarning({ open: false, message: "" });
  };

  return (
    <div className="form-page-container">
      <div className="form-page-content">
        <Card className="form-card" padding="xl">
          <h2 className="form-title">Agregar Nueva Electiva</h2>

          <Form
            form={form}
            name="add-elective-form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="ele_codigo"
              label="Código"
              rules={[{ validator: validateEleCodigo }]}
              hasFeedback={touchedFields.ele_codigo}
              validateStatus={touchedFields.ele_codigo ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: ES104"
                size="large"
                maxLength={10}
                showCount
                onBlur={() => handleFieldTouch("ele_codigo")}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.toUpperCase();
                }}
              />
            </Form.Item>

            <Form.Item
              name="ele_nombre"
              label="Nombre de la Electiva"
              rules={[{ validator: validateEleNombre }]}
              hasFeedback={touchedFields.ele_nombre}
              validateStatus={touchedFields.ele_nombre ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: Desarrollo Web Avanzado"
                size="large"
                maxLength={100}
                showCount
                onBlur={() => handleFieldTouch("ele_nombre")}
              />
            </Form.Item>

            <Form.Item
              name="pro_codigo"
              label="Programa Académico"
              rules={[
                { required: true, message: "Por favor selecciona el programa" },
              ]}
              hasFeedback={touchedFields.pro_codigo}
              validateStatus={touchedFields.pro_codigo ? undefined : ""}
            >
              <Select
                placeholder="Selecciona un programa"
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) ?? false
                }
                notFoundContent="No se encontraron programas"
                onBlur={() => handleFieldTouch("pro_codigo")}
                onSelect={() => handleFieldTouch("pro_codigo")}
              >
                {programs.map((program: any) => (
                  <Option key={program.pro_codigo} value={program.pro_codigo}>
                    {program.pro_nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Botones */}
            <Form.Item>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/electives")}
                  size="medium"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  disabled={!isFormValid}
                >
                  Guardar
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Modales SIEMPRE montados */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={handleWarningClose}
      />
      <SuccessModal
        open={success.open}
        message={success.message}
        onClose={handleSuccessClose}
      />
      <ConfirmModal
        open={confirm.open}
        message={`¿Deseas reactivar la electiva "${confirm.ele_nombre}"?`}
        onConfirm={handleReactivate}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default AddElective;
