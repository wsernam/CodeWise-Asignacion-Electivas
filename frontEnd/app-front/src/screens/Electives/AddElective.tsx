import React, { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import { useNavigate } from "react-router";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../components/shared/SuccessModal/SuccessModal";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore";
import type { IElective } from "../../models/elective";

const { Option } = Select;

const AddElective: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const formValues = Form.useWatch([], form);

  const [touchedFields, setTouchedFields] = useState({
    codigo: false,
    nombre: false,
    programa: false,
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

  const addElective = useElectiveStore((state) => state.addElective);
  const reactivateElective = useElectiveStore(
    (state) => state.reactivateElective
  );
  const programs = useProgramStore((state) => state.programs);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const validateCodigo = (_: any, value: string) => {
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
      touchedFields.programa
    ) {
      checkValidity();
    }
  }, [form, formValues, touchedFields]);

  const onFinish = async (values: IElective) => {
    try {
      const cleanedValues = {
        ...values,
        nombre: values.nombre.trim().replace(/\s+/g, " "),
        active: true,
      };

      await addElective(cleanedValues);

      setSuccess({
        open: true,
        message: `Electiva "${cleanedValues.nombre}" agregada correctamente`,
      });
    } catch (err: any) {
      if (err.message === "EXISTS_INACTIVE" && err.existing) {
        setWarning({
          open: true,
          message: `Ya existe una electiva "${err.existing.nombre}" con el código "${err.existing.codigo}" pero está inactiva.`,
        });
        setConfirm({
          open: true,
          codigo: err.existing.codigo,
          nombre: err.existing.nombre,
        });
      } else if (err.message === "EXISTS_ACTIVE" && err.existing) {
        setWarning({
          open: true,
          message: `Ya existe una electiva activa con el código "${err.existing.codigo}" o nombre "${err.existing.nombre}"`,
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
      await reactivateElective(confirm.codigo);
      setSuccess({
        open: true,
        message: `Electiva "${confirm.nombre}" reactivada correctamente`,
      });
      setConfirm({ open: false, codigo: "", nombre: "" });
      setWarning({ open: false, message: "" });
    } catch (error) {
      setWarning({
        open: true,
        message: "Error al reactivar la electiva",
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
    form.resetFields();
    setTouchedFields({ codigo: false, nombre: false, programa: false });
    navigate("/electives");
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
          <h2 className="form-title">Agregar Nueva Electiva</h2>

          <Form
            form={form}
            name="add-elective-form"
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
                placeholder="Ejemplo: ES104"
                size="large"
                maxLength={10}
                showCount
                onBlur={() => handleFieldTouch("codigo")}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.toUpperCase();
                }}
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
                  <Option key={program.codigo} value={program.nombre}>
                    {program.nombre}
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
      <ConfirmModal
        open={confirm.open}
        message={`¿Deseas reactivar la electiva "${confirm.nombre}"?`}
        onConfirm={handleReactivate}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default AddElective;
