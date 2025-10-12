import React, { useEffect, useState } from "react";
import { Form, Input, Select } from "antd";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useNavigate, useParams } from "react-router";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";
import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore";
import type { IElective } from "../../models/elective";

const { Option } = Select;

const EditElective: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { codigo } = useParams<{ codigo: string }>();
  const formValues = Form.useWatch([], form);

  const [touchedFields, setTouchedFields] = useState({
    nombre: false,
    programa: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [electiveFound, setElectiveFound] = useState(false);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const electives = useElectiveStore((state) => state.electives);
  const updateElective = useElectiveStore((state) => state.updateElective);
  const fetchElectives = useElectiveStore((state) => state.fetchElectives);
  const programs = useProgramStore((state) => state.programs);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);

  useEffect(() => {
    if (electives.length === 0) fetchElectives();
    if (programs.length === 0) fetchPrograms();
  }, [fetchElectives, fetchPrograms, electives.length, programs.length]);

  useEffect(() => {
    if (codigo && electives.length > 0) {
      const elective = electives.find((e) => e.codigo === codigo && e.active);

      if (elective) {
        form.setFieldsValue({
          codigo: elective.codigo,
          nombre: elective.nombre,
          programa: elective.programa,
        });
        setElectiveFound(true);
      } else {
        setWarning({
          open: true,
          message: "Electiva no encontrada o está inactiva",
        });
      }
    }
  }, [codigo, electives, form]);

  const validateNombre = (_: any, value: string) => {
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

    const existingElective = electives.find(
      (e) =>
        e.nombre.toLowerCase() === value.toLowerCase() &&
        e.codigo !== codigo &&
        e.active
    );
    if (existingElective)
      return Promise.reject(
        `Ya existe una electiva activa con el nombre "${value}"`
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

    if (touchedFields.nombre || touchedFields.programa) {
      checkValidity();
    }
  }, [form, formValues, touchedFields]);

  const onFinish = async (values: IElective) => {
    if (!codigo) return;

    try {
      const cleanedValues = {
        ...values,
        codigo: codigo,
        nombre: values.nombre.trim().replace(/\s+/g, " "),
        active: true,
      };

      await updateElective(codigo, cleanedValues);
      setSuccess({
        open: true,
        message: "Electiva actualizada correctamente",
      });
    } catch (error: any) {
      setWarning({
        open: true,
        message: "Error al actualizar la electiva",
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
    navigate("/electives");
  };

  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
    if (warning.message.includes("no encontrada")) {
      navigate("/electives");
    }
  };

  if (!electiveFound && electives.length > 0) {
    return (
      <div className="form-page-container">
        <Header />
        <Navbar />
        <div className="form-page-content">
          <Card className="form-card" padding="xl">
            <h2 className="form-title">Electiva no encontrada</h2>
            <p>La electiva que intentas editar no existe o está inactiva.</p>
            <Button variant="primary" onClick={() => navigate("/electives")}>
              ← Volver a lista de electivas
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <Header />
      <Navbar />

      <div className="form-page-content">
        <Card className="form-card" padding="xl">
          <h2 className="form-title">Editar Electiva</h2>

          <Form
            form={form}
            name="edit-elective-form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item name="codigo" label="Código">
              <Input
                disabled
                size="large"
                style={{ backgroundColor: "#f5f5f5", color: "#666" }}
              />
            </Form.Item>

            <Form.Item
              name="nombre"
              label="Nombre de la Electiva"
              rules={[{ validator: validateNombre }]}
              hasFeedback={touchedFields.nombre}
              validateStatus={touchedFields.nombre ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: Desarrollo Web Avanzado"
                size="large"
                maxLength={100}
                showCount
                onBlur={() => handleFieldTouch("nombre")}
              />
            </Form.Item>

            <Form.Item
              name="programa"
              label="Programa Académico"
              rules={[
                { required: true, message: "Por favor selecciona el programa" },
              ]}
              hasFeedback={touchedFields.programa}
              validateStatus={touchedFields.programa ? undefined : ""}
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
                onBlur={() => handleFieldTouch("programa")}
                onSelect={() => handleFieldTouch("programa")}
              >
                {programs.map((program) => (
                  <Option key={program.pro_codigo} value={program.pro_nombre}>
                    {program.pro_nombre}
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
                onClick={() => navigate("/electives")}
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
    </div>
  );
};

export default EditElective;
