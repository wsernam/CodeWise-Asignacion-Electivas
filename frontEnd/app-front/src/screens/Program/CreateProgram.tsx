import React, { useState } from "react";
import { Form, Input, Select } from "antd";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import { useNavigate } from "react-router";
import { useProgramStore } from "../../store/programStore";
import type { IProgram as Program } from "../../models/program";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";

const { Option } = Select;

const CreateProgram: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const formValues = Form.useWatch([], form);

  const [touchedFields, setTouchedFields] = useState({
    codigo: false,
    nombre: false,
    facultad: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [confirm, setConfirm] = useState<{
    open: boolean;
    codigo: string;
    nombre: string;
  }>({
    open: false,
    codigo: "",
    nombre: "",
  });
  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const addProgram = useProgramStore((state) => state.addProgram);

  const facultades = [
    "Facultad de Ingeniería Electrónica y de Telecomunicaciones",
    "Facultad de Ingeniería Civil",
    "Facultad de Ciencias Naturales y Exactas",
  ];

  const validateCodigo = (_: any, value: string) => {
    if (!value) return Promise.reject("Por favor ingresa el código");
    if (!/^\d+$/.test(value))
      return Promise.reject("El código debe contener solo números");
    if (value.length < 2 || value.length > 10)
      return Promise.reject("El código debe tener entre 2 y 10 dígitos");
    return Promise.resolve();
  };

  const validateNombre = (_: any, value: string) => {
    if (!value)
      return Promise.reject("Por favor ingresa el nombre del programa");
    if (value.length < 5)
      return Promise.reject("El nombre debe tener al menos 5 caracteres");
    if (value.length > 150)
      return Promise.reject("El nombre no puede exceder 150 caracteres");
    if (/^\s+|\s+$/.test(value))
      return Promise.reject(
        "El nombre no puede empezar o terminar con espacios"
      );
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
      return Promise.reject("El nombre solo puede contener letras y espacios");
    return Promise.resolve();
  };

  const handleFieldTouch = (fieldName: keyof typeof touchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  React.useEffect(() => {
    const checkValidity = async () => {
      try {
        await form.validateFields();
        setIsFormValid(true);
      } catch {
        setIsFormValid(false);
      }
    };

    if (
      touchedFields.codigo ||
      touchedFields.nombre ||
      touchedFields.facultad
    ) {
      checkValidity();
    }
  }, [form, formValues, touchedFields]);

  const onFinish = async (values: Program) => {
    try {
      const cleanedValues = {
        ...values,
        nombre: values.nombre.trim().replace(/\s+/g, " "),
        active: true,
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
          message: `Ya existe un programa "${err.existing.nombre}" con el código "${err.existing.codigo}" pero está inactivo.`,
        });
        setConfirm({
          open: true,
          codigo: err.existing.codigo,
          nombre: err.existing.nombre,
        });
      } else if (err.message === "EXISTS_ACTIVE" && err.existing) {
        setWarning({
          open: true,
          message: `Ya existe un programa activo con el código "${err.existing.codigo}" o nombre "${err.existing.nombre}"`,
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
    setTouchedFields({ codigo: false, nombre: false, facultad: false });
    navigate("/programs");
  };

  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
  };

  const handleConfirmCancel = () => {
    setConfirm({ open: false, codigo: "", nombre: "" });
    setWarning({ open: false, message: "" });
  };

  return (
    <div className="form-page-container">
      <Header />
      <Navbar />

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
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ validator: validateCodigo }]}
              hasFeedback={touchedFields.codigo}
              validateStatus={touchedFields.codigo ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: 09"
                size="large"
                maxLength={10}
                showCount
                onBlur={() => handleFieldTouch("codigo")}
              />
            </Form.Item>

            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ validator: validateNombre }]}
              hasFeedback={touchedFields.nombre}
              validateStatus={touchedFields.nombre ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: Ingeniería de Software"
                size="large"
                maxLength={150}
                showCount
                onBlur={() => handleFieldTouch("nombre")}
              />
            </Form.Item>

            <Form.Item
              name="facultad"
              label="Facultad"
              rules={[
                { required: true, message: "Por favor selecciona la facultad" },
              ]}
              hasFeedback={touchedFields.facultad}
              validateStatus={touchedFields.facultad ? undefined : ""}
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
                onBlur={() => handleFieldTouch("facultad")}
                onSelect={() => handleFieldTouch("facultad")}
              >
                {facultades.map((facultad) => (
                  <Option key={facultad} value={facultad}>
                    {facultad}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                disabled={!isFormValid}
              >
                Guardar
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                variant="ghost"
                onClick={() => navigate("/programs")}
                size="medium"
              >
                Volver
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Footer />

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
        message={`¿Deseas reactivar el programa "${confirm.nombre}"?`}
        onConfirm={() => {
          // Aquí iría la lógica de reactivación cuando la implementes
          setWarning({
            open: true,
            message: "Funcionalidad de reactivación no implementada",
          });
          setConfirm({ open: false, codigo: "", nombre: "" });
        }}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default CreateProgram;
