import React, { useEffect, useState } from "react";
import { Form, Input, Select } from "antd";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import { useNavigate, useParams } from "react-router";
import { useProgramStore } from "../../../store/Form/programStore";
import type { IProgram as Program } from "../../../models/Form/program";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";

const { Option } = Select;

const EditProgram: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { codigo } = useParams<{ codigo: string }>();
  const formValues = Form.useWatch([], form);

  const faculties = useProgramStore((state) => state.faculties);
  const fetchFaculties = useProgramStore((state) => state.fetchFaculties);

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

  const [initialValues, setInitialValues] = useState<{
    nombre: string;
    facultad: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const programs = useProgramStore((state) => state.programs);
  const updateProgram = useProgramStore((state) => state.updateProgram);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);

  const facultades = faculties.map((f) => f.fac_nombre);

  useEffect(() => {
    if (programs.length === 0) {
      fetchPrograms();
    }
  }, [fetchPrograms, programs.length]);

  useEffect(() => {
    if (faculties.length === 0) {
      fetchFaculties();
    }
  }, [fetchFaculties, faculties.length]);

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

        setInitialValues({
          nombre: program.pro_nombre,
          facultad: program.fac_nombre,
        });

        // 🔹 Marcar los campos como “tocados” desde el inicio
        // para que al escribir se valide en tiempo real
        setTouchedFields({
          nombre: true,
          facultad: true,
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
    const sanitized = (value ?? "").replace(/\s+$/, ""); // quitar solo espacios del final

    if (!sanitized)
      return Promise.reject("Por favor ingresa el nombre del programa");
    if (sanitized.length < 5)
      return Promise.reject("El nombre debe tener al menos 5 caracteres");
    if (sanitized.length > 150)
      return Promise.reject("El nombre no puede exceder 150 caracteres");

    if (/^\s+/.test(value ?? ""))
      return Promise.reject("El nombre no puede empezar con espacios");

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(sanitized))
      return Promise.reject("El nombre solo puede contener letras y espacios");

    const existingProgram = programs.find(
      (p) =>
        p.pro_nombre.toLowerCase().trim().replace(/\s+/g, " ") ===
          sanitized.toLowerCase().trim().replace(/\s+/g, " ") &&
        p.pro_codigo.toString() !== codigo &&
        p.pro_activo !== false
    );

    if (existingProgram)
      return Promise.reject(
        `Ya existe un programa activo con el nombre "${sanitized}"`
      );

    return Promise.resolve();
  };

  const handleFieldTouch = (fieldName: keyof typeof touchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  useEffect(() => {
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

  const normalizeForChange = (s: string | undefined | null) =>
    (s ?? "").replace(/\s+$/, "");

  useEffect(() => {
    if (!initialValues) return;

    const currentNombre = (formValues as any)?.nombre ?? "";
    const currentFacultad = (formValues as any)?.facultad ?? "";

    const changedNombre =
      normalizeForChange(currentNombre) !==
      normalizeForChange(initialValues.nombre);

    const changedFacultad = currentFacultad !== initialValues.facultad;

    setHasChanges(changedNombre || changedFacultad);
  }, [formValues, initialValues]);

  const onFinish = async (values: any) => {
    if (!codigo) return;

    try {
      const facultadSeleccionada = faculties.find(
        (f) => f.fac_nombre === values.facultad
      );

      const cleanedValues: Program = {
        pro_codigo: codigo,
        pro_nombre: values.nombre.trim().replace(/\s+/g, " "),
        fac_codigo: facultadSeleccionada?.fac_codigo ?? 1,
        fac_nombre: values.facultad,
        pro_activo: true,
      };

      await updateProgram(codigo, cleanedValues);
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
                onBlur={(e) => {
                  const value = e.target.value;
                  const cleaned = value.replace(/\s+$/, "");
                  form.setFieldsValue({ nombre: cleaned });
                  handleFieldTouch("nombre");
                }}
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
                  disabled={!isFormValid || !hasChanges}
                >
                  Guardar
                </Button>
              </div>
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
