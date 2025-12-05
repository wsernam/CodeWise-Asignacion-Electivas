import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Select } from "antd";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import { useNavigate, useParams } from "react-router";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import { useElectiveStore } from "../../../store/Form/electiveStore";
import { useProgramStore } from "../../../store/Form/programStore";
import type { IElective } from "../../../models/Form/elective";

const EditElective: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { ele_codigo } = useParams<{ ele_codigo: string }>();
  const formValues = Form.useWatch([], form);

  const [touchedFields, setTouchedFields] = useState({
    ele_nombre: false,
    pro_codigo: false,
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

  // Stores
  const electives = useElectiveStore((s) => s.electives);
  const updateElective = useElectiveStore((s) => s.updateElective);
  const fetchElectives = useElectiveStore((s) => s.fetchElectives);

  const programs = useProgramStore((s) => s.programs);
  const fetchPrograms = useProgramStore((s) => s.fetchPrograms);

  useEffect(() => {
    if (electives.length === 0) fetchElectives();
    if (programs.length === 0) fetchPrograms();
  }, [fetchElectives, fetchPrograms, electives.length, programs.length]);

  useEffect(() => {
    if (ele_codigo && electives.length > 0) {
      const elective = electives.find(
        (e) => String(e.ele_codigo) === String(ele_codigo) && e.ele_estado
      );
      if (elective) {
        form.setFieldsValue({
          ele_codigo: elective.ele_codigo,
          ele_nombre: elective.ele_nombre,
          pro_codigo: elective.pro_codigo,
        });

        // 🔹 Marcar los campos como tocados automáticamente
        setTouchedFields({
          ele_nombre: true,
          pro_codigo: true,
        });

        // 🔹 Forzar validación de los valores cargados
        form.validateFields().then(() => {
          setIsFormValid(true);
        });
        setElectiveFound(true);
      } else {
        setWarning({
          open: true,
          message: "Electiva no encontrada o está inactiva",
        });
      }
    }
  }, [ele_codigo, electives, form]);

  const normalizeName = (s: string) =>
    (s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita tildes
      .trim()
      .replace(/\s+/g, " ") // colapsa espacios
      .toUpperCase();

  const isActive = (v: any) =>
    v === true || v === 1 || v === "A" || v === "ACTIVO";

  const validateNombre = (_: any, value: string) => {
    if (!value) return Promise.reject("Por favor ingresa el nombre");
    const v = value.trim();

    if (v.length < 3)
      return Promise.reject("El nombre debe tener al menos 3 caracteres");
    if (v.length > 100)
      return Promise.reject("El nombre no puede exceder 100 caracteres");
    if (/^\s+|\s+$/.test(value))
      return Promise.reject(
        "El nombre no puede empezar o terminar con espacios"
      );
    if (/\d/.test(v))
      return Promise.reject("El nombre no puede contener números");
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(v))
      return Promise.reject("El nombre solo puede contener letras y espacios");

    const target = normalizeName(v);

    // 1) Excluir la misma electiva (si no cambió el nombre, permitir)
    const current = electives.find(
      (e) => String(e.ele_codigo) === String(ele_codigo)
    );
    if (current && normalizeName(current.ele_nombre) === target) {
      return Promise.resolve();
    }

    // 2) Chequear duplicados en OTRAS electivas activas
    const duplicated = electives.some(
      (e) =>
        String(e.ele_codigo) !== String(ele_codigo) && // excluye la actual
        isActive(e.ele_estado) && // solo activas
        normalizeName(e.ele_nombre) === target // mismo nombre normalizado
    );

    return duplicated
      ? Promise.reject(`Ya existe una electiva activa con el nombre "${v}"`)
      : Promise.resolve();
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
    if (touchedFields.ele_nombre || touchedFields.pro_codigo) {
      checkValidity();
    }
  }, [form, formValues, touchedFields]);

  const onFinish = async (values: IElective) => {
    if (!ele_codigo) return;
    try {
      const cleanedValues: IElective = {
        ...values,
        ele_codigo: ele_codigo,
        ele_nombre: values.ele_nombre.trim().replace(/\s+/g, " "),
        ele_estado: true,
      };
      await updateElective(ele_codigo, cleanedValues);
      setSuccess({ open: true, message: "Electiva actualizada correctamente" });
    } catch (error) {
      setWarning({ open: true, message: "Error al actualizar la electiva" });
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

  const programOptions = useMemo(
    () =>
      programs
        .filter((p) => p.pro_activo !== false)
        .map((p) => ({
          value: p.pro_codigo,
          label: p.pro_nombre,
        })),
    [programs]
  );

  if (!electiveFound && electives.length > 0) {
    return (
      <div className="form-page-container">
        <div className="form-page-content">
          <Card className="form-card" padding="xl">
            <h2 className="form-title">Electiva no encontrada</h2>
            <p>La electiva que intentas editar no existe o está inactiva.</p>
            <Button variant="primary" onClick={() => navigate("/electives")}>
              ← Volver a lista de electivas
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-container">
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
            <Form.Item name="ele_codigo" label="Código">
              <Input
                disabled
                size="large"
                style={{ backgroundColor: "#f5f5f5", color: "#666" }}
              />
            </Form.Item>

            <Form.Item
              name="ele_nombre"
              label="Nombre de la Electiva"
              rules={[{ validator: validateNombre }]}
              hasFeedback={touchedFields.ele_nombre}
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
            >
              <Select
                placeholder="Selecciona un programa"
                size="large"
                showSearch
                options={programOptions}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                notFoundContent="No se encontraron programas"
                onBlur={() => handleFieldTouch("pro_codigo")}
                onSelect={() => handleFieldTouch("pro_codigo")}
              />
            </Form.Item>

            {/* Botones */}
            <Form.Item style={{ marginTop: "2rem" }}>
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
