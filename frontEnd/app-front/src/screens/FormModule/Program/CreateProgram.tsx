import React, { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import { useNavigate } from "react-router";
import { useProgramStore } from "../../../store/Form/programStore";
import type { IProgram as Program } from "../../../models/Form/program";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";

const { Option } = Select;

const CreateProgram: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const formValues = Form.useWatch([], form);

  const [touchedFields, setTouchedFields] = useState({
    pro_codigo: false,
    pro_nombre: false,
    fac_nombre: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const [confirm, setConfirm] = useState<{
    open: boolean;
    pro_codigo: string;
    pro_nombre: string;
  }>({
    open: false,
    pro_codigo: "",
    pro_nombre: "",
  });

  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const addProgram = useProgramStore((state) => state.addProgram);
  const faculties = useProgramStore((state) => state.faculties);
  const fetchFaculties = useProgramStore((state) => state.fetchFaculties);

  useEffect(() => {
    if (faculties.length === 0) {
      fetchFaculties();
    }
  }, [fetchFaculties, faculties.length]);

  const facultades = Array.from(
    new Set(faculties.map((f) => f.fac_nombre))
  ).filter(Boolean);

  // ========= VALIDACIONES (ajustadas para ignorar espacios al final) =========

  const validateCodigo = (_: any, value: string) => {
    const sanitized = (value ?? "").replace(/\s+$/, ""); // quita solo espacios del final

    if (!sanitized)
      return Promise.reject("Por favor ingresa el código");
    if (sanitized.length < 2 || sanitized.length > 10)
      return Promise.reject("El código debe tener entre 2 y 10 dígitos");

    return Promise.resolve();
  };

  const validateNombre = (_: any, value: string) => {
    const sanitized = (value ?? "").replace(/\s+$/, ""); // ignora espacios del final
    if (!sanitized)
      return Promise.reject("Por favor ingresa el nombre del programa");
    if (sanitized.length < 5)
      return Promise.reject("El nombre debe tener al menos 5 caracteres");
    if (sanitized.length > 150)
      return Promise.reject("El nombre no puede exceder 150 caracteres");
    // Solo evitamos espacios al inicio, no al final
    if (/^\s+/.test(value ?? ""))
      return Promise.reject("El nombre no puede empezar con espacios");
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(sanitized))
      return Promise.reject("El nombre solo puede contener letras y espacios");
    return Promise.resolve();
  };

  const handleFieldTouch = (fieldName: keyof typeof touchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // 🔹 Validación en tiempo real para habilitar el botón, sin mostrar errores
  useEffect(() => {
    const checkValidity = async () => {
      try {
        // validateOnly: true => NO actualiza los errores visuales del formulario
        await form.validateFields({ validateOnly: true });
        setIsFormValid(true);
      } catch {
        setIsFormValid(false);
      }
    };

    // Siempre que cambie algo en el form, intentamos validar "en silencio"
    checkValidity();
  }, [form, formValues]);

  const onFinish = async (values: any) => {
    try {
      const facultadSeleccionada = faculties.find(
        (f) => f.fac_nombre === values.fac_nombre
      );

      if (!facultadSeleccionada) {
        setWarning({
          open: true,
          message: "Facultad no válida seleccionada",
        });
        return;
      }

      const cleanedValues: Program = {
        // Seguridad extra: quitar espacios del final del código
        pro_codigo: values.pro_codigo.replace(/\s+$/, ""),
        // Limpieza fuerte del nombre
        pro_nombre: values.pro_nombre.trim().replace(/\s+/g, " "),
        fac_codigo: facultadSeleccionada.fac_codigo,
        fac_nombre: values.fac_nombre,
        pro_activo: true,
      };

      await addProgram(cleanedValues);

      setSuccess({
        open: true,
        message: "Programa creado correctamente",
      });
    } catch (err: any) {
      if (err.message === "EXISTS_INACTIVE" && err.existing) {
        setWarning({
          open: true,
          message: `Ya existe un programa "${err.existing.pro_nombre}" con el código "${err.existing.pro_codigo}" pero está inactivo.`,
        });
        setConfirm({
          open: true,
          pro_codigo: err.existing.pro_codigo,
          pro_nombre: err.existing.pro_nombre,
        });
      } else if (err.message === "EXISTS_ACTIVE" && err.existing) {
        setWarning({
          open: true,
          message: `Ya existe un programa activo con el código "${err.existing.pro_codigo}" o nombre "${err.existing.pro_nombre}"`,
        });
      } else {
        setWarning({
          open: true,
          message: "Error inesperado al crear el programa",
        });
      }
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
    form.resetFields();
    setTouchedFields({
      pro_codigo: false,
      pro_nombre: false,
      fac_nombre: false,
    });
    navigate("/programs");
  };

  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
  };

  const handleConfirmCancel = () => {
    setConfirm({ open: false, pro_codigo: "", pro_nombre: "" });
    setWarning({ open: false, message: "" });
  };

  return (
    <div className="form-page-container">
      <div className="form-page-content">
        <Card className="form-card" padding="xl">
          <h2 className="form-title">Agregar Nuevo Programa</h2>

          <Form
            form={form}
            name="create-program-form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            {/* Código */}
            <Form.Item
              name="pro_codigo"
              label="Código"
              rules={[{ validator: validateCodigo }]}
              hasFeedback={touchedFields.pro_codigo}
              validateStatus={touchedFields.pro_codigo ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: 09"
                size="large"
                maxLength={10}
                showCount
                onChange={() => handleFieldTouch("pro_codigo")}
                onBlur={(e) => {
                  const value = e.target.value;
                  const cleaned = value.replace(/\s+$/, "");
                  form.setFieldsValue({ pro_codigo: cleaned });
                }}
              />
            </Form.Item>

            {/* Nombre */}
            <Form.Item
              name="pro_nombre"
              label="Nombre"
              rules={[{ validator: validateNombre }]}
              hasFeedback={touchedFields.pro_nombre}
              validateStatus={touchedFields.pro_nombre ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: Ingeniería de Software"
                size="large"
                maxLength={150}
                showCount
                onChange={() => handleFieldTouch("pro_nombre")}
                onBlur={(e) => {
                  const value = e.target.value;
                  const cleaned = value.replace(/\s+$/, "");
                  form.setFieldsValue({ pro_nombre: cleaned });
                }}
              />
            </Form.Item>

            {/* Facultad */}
            <Form.Item
              name="fac_nombre"
              label="Facultad"
              rules={[
                { required: true, message: "Por favor selecciona la facultad" },
              ]}
              hasFeedback={touchedFields.fac_nombre}
              validateStatus={touchedFields.fac_nombre ? undefined : ""}
            >
              <Select
                placeholder="Selecciona una facultad"
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) ?? false
                }
                onChange={() => handleFieldTouch("fac_nombre")}
              >
                {facultades.map((facultad) => (
                  <Option key={facultad} value={facultad}>
                    {facultad}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Botones */}
            <Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/programs")}
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
        message={`¿Deseas reactivar el programa "${confirm.pro_nombre}"?`}
        onConfirm={() => {
          setWarning({
            open: true,
            message: "Funcionalidad de reactivación no implementada",
          });
          setConfirm({ open: false, pro_codigo: "", pro_nombre: "" });
        }}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default CreateProgram;
