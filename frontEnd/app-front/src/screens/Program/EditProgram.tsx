import React, { useEffect, useState } from "react";
import { Form, Input, Select } from "antd";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useNavigate, useParams } from "react-router";
import { useProgramStore } from "../../store/programStore";
import type { IProgram as Program } from "../../models/program";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";
import WarningModal from "../../components/shared/WarningModal/WarningModal";

const { Option } = Select;

const EditProgram: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { codigo } = useParams<{ codigo: string }>();
  const formValues = Form.useWatch([], form);

  const [touchedFields, setTouchedFields] = useState({
    nombre: false,
    facultad: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [programFound, setProgramFound] = useState(false);
  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const programs = useProgramStore((state) => state.programs);
  const updateProgram = useProgramStore((state) => state.updateProgram);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);

  // Obtener facultades únicas de los programas existentes
  const facultades = Array.from(
    new Set(programs.map((p) => p.fac_nombre))
  ).filter(Boolean);

  useEffect(() => {
    if (programs.length === 0) {
      fetchPrograms();
    }
  }, [fetchPrograms, programs.length]);

  useEffect(() => {
    if (codigo && programs.length > 0) {
      const program = programs.find(
        (p) => p.pro_codigo.toString() === codigo && p.pro_activo !== false
      );

      if (program) {
        form.setFieldsValue({
          codigo: program.pro_codigo,
          nombre: program.pro_nombre,
          facultad: program.fac_nombre,
        });
        setProgramFound(true);
      } else {
        setWarning({
          open: true,
          message: "Programa no encontrado o está inactivo",
        });
      }
    }
  }, [codigo, programs, form]);

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

    // CORREGIDO: usar pro_nombre en lugar de fac_nombre
    const existingProgram = programs.find(
      (p) =>
        p.pro_nombre.toLowerCase() === value.toLowerCase() && // ← CAMBIADO
        p.pro_codigo.toString() !== codigo &&
        p.pro_activo !== false
    );
    if (existingProgram)
      return Promise.reject(
        `Ya existe un programa activo con el nombre "${value}"`
      );

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

    if (touchedFields.nombre || touchedFields.facultad) {
      checkValidity();
    }
  }, [form, formValues, touchedFields]);

  const onFinish = async (values: any) => {
    if (!codigo) return;

    try {
      const cleanedValues: Program = {
        pro_codigo: parseInt(codigo),
        pro_nombre: values.nombre.trim().replace(/\s+/g, " "),
        fac_codigo: 2,
        fac_nombre: values.facultad,
        pro_activo: true,
      };

      await updateProgram(parseInt(codigo), cleanedValues);
      setSuccess({
        open: true,
        message: "Programa actualizado correctamente",
      });
    } catch (error: any) {
      setWarning({
        open: true,
        message: "Error al actualizar el programa",
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
    navigate("/programs");
  };

  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
    if (warning.message.includes("no encontrado")) {
      navigate("/programs");
    }
  };

  if (!programFound && programs.length > 0) {
    return (
      <div className="auth-page">
        <div className="auth-page-content">
          <Card padding="xl">
            <h2>Programa no encontrado</h2>
            <p>El programa que intentas editar no existe o está inactivo.</p>
            <Button variant="primary" onClick={() => navigate("/programs")}>
              ← Volver a lista de programas
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <Card padding="xl">
          <h2>Editar Programa</h2>

          <Form
            form={form}
            name="edit-program-form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item name="codigo" label="Código del Programa">
              <Input
                disabled
                size="large"
                style={{ backgroundColor: "#f5f5f5", color: "#666" }}
              />
            </Form.Item>

            <Form.Item
              name="nombre"
              label="Nombre del Programa"
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
                placeholder="Selecciona la facultad"
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
      <SuccessModal
        open={success.open}
        message={success.message}
        onClose={handleSuccessClose}
      />
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={handleWarningClose}
      />
    </div>
  );
};

export default EditProgram;
