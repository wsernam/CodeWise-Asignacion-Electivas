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

// Stores globales para estado
import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore";

// Tipos e interfaces
import type { IElective } from "../../models/elective";

const { Option } = Select;

const AddElective: React.FC = () => {
  // ========== HOOKS Y ESTADO ==========
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Funciones del store de electivas
  const addElective = useElectiveStore((state) => state.addElective);
  const reactivateElective = useElectiveStore(
    (state) => state.reactivateElective
  );
  // Funciones del store de programas (para el dropdown)
  const programs = useProgramStore((state) => state.programs);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);

  // ========== ESTADO LOCAL ==========
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

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // ========== VALIDACIONES ==========

  const validateCodigo = (_: any, value: string) => {
    if (!value) {
      return Promise.reject("Por favor ingresa el código");
    }

    // Validar longitud
    if (value.length < 2 || value.length > 10) {
      return Promise.reject("El código debe tener entre 2 y 10 caracteres");
    }

    // Validar que tenga al menos una letra y un número
    if (!/[a-zA-Z]/.test(value)) {
      return Promise.reject("El código debe contener al menos una letra");
    }

    if (!/\d/.test(value)) {
      return Promise.reject("El código debe contener al menos un número");
    }

    // Validar que solo contenga letras y números
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return Promise.reject("El código solo puede contener letras y números");
    }
    return Promise.resolve();
  };

  const validateNombre = (_: any, value: string) => {
    if (!value) {
      return Promise.reject("Por favor ingresa el nombre");
    }
    if (value.length < 3) {
      return Promise.reject("El nombre debe tener al menos 3 caracteres");
    }
    if (value.length > 100) {
      return Promise.reject("El nombre no puede exceder 100 caracteres");
    }
    if (/^\s+|\s+$/.test(value)) {
      return Promise.reject(
        "El nombre no puede empezar o terminar con espacios"
      );
    }
    if (/\d/.test(value)) {
      return Promise.reject("El nombre no puede contener números");
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
      return Promise.reject("El nombre solo puede contener letras y espacios");
    }
    return Promise.resolve();
  };

  // ========== MANEJADOR PRINCIPAL ==========

  const onFinish = async (values: IElective) => {
    try {
      // Limpiar y estandarizar datos - DEJAR TEXTO ORIGINAL
      const cleanedValues = {
        ...values,
        nombre: values.nombre.trim().replace(/\s+/g, " "), // Mantener formato original
        active: true,
      };

      // Intentar agregar al store
      await addElective(cleanedValues);

      // Éxito: usar modal de éxito
      setSuccess({
        open: true,
        message: `Electiva "${cleanedValues.nombre}" agregada correctamente`,
      });

      // Limpiar formulario inmediatamente
      form.resetFields();
    } catch (err: any) {
      console.error("Error al agregar electiva:", err);

      // Manejo específico de errores de duplicación - USANDO MODALES
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
        // USAR MODAL EN LUGAR DE message.error()
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

  // ========== MANEJADORES DE MODALES ==========

  const handleReactivate = async () => {
    try {
      await reactivateElective(confirm.codigo);
      setSuccess({
        open: true,
        message: `Electiva "${confirm.nombre}" reactivada correctamente`,
      });

      // Cerrar solo el modal de confirmación, mantener el de éxito abierto
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
    navigate("/electives"); // Redirigir solo cuando el usuario cierre el modal
  };

  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
  };

  const handleConfirmCancel = () => {
    setConfirm({ open: false, codigo: "", nombre: "" });
    setWarning({ open: false, message: "" });
  };

  const handleCancelForm = () => {
    navigate("/electives");
  };

  // ========== RENDERIZADO ==========
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
            {/* Campo código */}
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ validator: validateCodigo }]}
              hasFeedback
            >
              <Input
                placeholder="Ejemplo: ES104"
                size="large"
                maxLength={10}
                showCount
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.toUpperCase();
                }}
              />
            </Form.Item>

            {/* Campo nombre - TEXTO ORIGINAL DEL USUARIO */}
            <Form.Item
              name="nombre"
              label="Nombre de la Electiva"
              rules={[{ validator: validateNombre }]}
              hasFeedback
            >
              <Input
                placeholder="Ejemplo: Desarrollo Web Avanzado"
                size="large"
                maxLength={100}
                showCount
              />
            </Form.Item>

            {/* Dropdown de programas */}
            <Form.Item
              name="programa"
              label="Programa Académico"
              rules={[
                { required: true, message: "Por favor selecciona el programa" },
              ]}
              hasFeedback
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
              >
                {programs.map((program) => (
                  <Option key={program.codigo} value={program.nombre}>
                    {program.nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Botones de acción */}
            <Form.Item>
              <Button type="submit" variant="primary" size="medium">
                Guardar Electiva
              </Button>
            </Form.Item>

            <Form.Item>
              <Button variant="ghost" onClick={handleCancelForm} size="medium">
                ← Volver a lista de electivas
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Footer />

      {/* Modal de advertencia */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={handleWarningClose}
      />

      {/* Modal de éxito */}
      <SuccessModal
        open={success.open}
        message={success.message}
        onClose={handleSuccessClose} // Solo se cierra cuando el usuario hace clic
      />

      {/* Modal de confirmación (reactivación) */}
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
