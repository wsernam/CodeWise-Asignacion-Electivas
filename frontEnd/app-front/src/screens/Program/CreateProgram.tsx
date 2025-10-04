import React, { useState } from "react";
import { Form, Input, message, Select } from "antd"; // Componentes de Ant Design
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import { useNavigate } from "react-router"; // Hook para navegación
import { useProgramStore } from "../../store/programStore"; // Store global
import type { Program } from "../../models/program"; // Tipo TypeScript
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";

const { Option } = Select; // Desestructuración para usar Select.Option más fácil

const CreateProgram: React.FC = () => {
  // ========== HOOKS Y ESTADO ==========

  // Hook de Ant Design para manejar el formulario
  const [form] = Form.useForm();

  // Hook de React Router para navegar entre páginas
  const navigate = useNavigate();

  // Extraer solo la función que necesitamos del store
  const addProgram = useProgramStore((state) => state.addProgram);

  // ========== ESTADO LOCAL DEL COMPONENTE ==========

  // Estado para el modal de advertencia
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Estado para el modal de confirmación
  const [confirm, setConfirm] = useState<{
    open: boolean;
    codigo: string;
    nombre: string;
  }>({
    open: false,
    codigo: "",
    nombre: "",
  });

  // Estado de carga (para mostrar spinner/deshabilitar botones)
  const [loading, setLoading] = useState(false);

  // ========== DATOS ESTÁTICOS ==========

  /**
   * Lista de facultades predefinidas
   * Esto vendría de una API o base de datos
   */
  const facultades = [
    1,
    2,
    3,
  ];

  // ========== FUNCIONES DE VALIDACIÓN ==========

  /**
   * validateCodigo - Validar campo código
   * @param _ - No usamos el primer parámetro (rule)
   * @param value - Valor del campo a validar
   * @returns Promise - Resuelve si es válido, rechaza con mensaje de error si no
   */
  const validateCodigo = (_: any, value: string) => {
    if (!value) {
      return Promise.reject("Por favor ingresa el código");
    }
    if (!/^\d+$/.test(value)) {
      return Promise.reject("El código debe contener solo números");
    }
    if (value.length < 2 || value.length > 10) {
      return Promise.reject("El código debe tener entre 2 y 10 dígitos");
    }
    return Promise.resolve(); // Todo bien
  };

  /**
   * validateNombre - Validar campo nombre
   */
  const validateNombre = (_: any, value: string) => {
    if (!value) {
      return Promise.reject("Por favor ingresa el nombre del programa");
    }
    if (value.length < 5) {
      return Promise.reject("El nombre debe tener al menos 5 caracteres");
    }
    if (value.length > 150) {
      return Promise.reject("El nombre no puede exceder 150 caracteres");
    }
    if (/^\s+|\s+$/.test(value)) {
      return Promise.reject(
        "El nombre no puede empezar o terminar con espacios"
      );
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
      return Promise.reject("El nombre solo puede contener letras y espacios");
    }
    return Promise.resolve();
  };

  // ========== MANEJADOR DE ENVÍO DEL FORMULARIO ==========

  /**
   * onFinish - Se ejecuta cuando el formulario pasa todas las validaciones
   * @param values - Objeto con todos los valores del formulario
   */
  const onFinish = async (values: Program) => {
    setLoading(true); // Empezar carga
    try {
      // Limpiar y estandarizar los datos antes de enviar
      const cleanedValues = {
        ...values,
        nombre: values.nombre.trim().replace(/\s+/g, " "), // Quitar espacios extra
        active: true, // Siempre activo al crear
      };

      // Intentar crear el programa en el store (y en el servicio)
      await addProgram(cleanedValues);

      // Si todo bien
      message.success("Programa creado correctamente");
      form.resetFields(); // Limpiar el formulario
      navigate("/programs"); // Redirigir a la lista
    } catch (err: any) {
      // MANEJO ESPECÍFICO DE ERRORES:

      // Caso 1: Programa existe pero está INACTIVO
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
      }
      // Caso 2: Programa ya existe y está ACTIVO
      else if (err.message === "EXISTS_ACTIVE" && err.existing) {
        message.error(
          `Ya existe un programa activo con el código "${err.existing.codigo}" o nombre "${err.existing.nombre}"`
        );
      }
      // Caso 3: Cualquier otro error
      else {
        message.error("Error inesperado al crear el programa");
      }
    } finally {
      setLoading(false); // Terminar carga (siempre se ejecuta)
    }
  };

  // ========== MANEJADORES DE MODALES ==========

  const handleCancel = () => {
    setConfirm({ open: false, codigo: "", nombre: "" });
    setWarning({ open: false, message: "" });
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="form-page-container">
      {/* Layout de la aplicación */}
      <Header />
      <Navbar />

      {/* Contenido principal */}
      <div className="form-page-content">
        <Card className="form-card" padding="xl">
          <h2 className="form-title">Agregar Nuevo Programa</h2>

          {/*
           * FORMULARIO ANT DESIGN
           * form: instancia del formulario
           * name: identificador único
           * onFinish: función que se ejecuta al enviar
           * layout: "vertical" para etiquetas arriba de los campos
           * disabled: deshabilitar durante carga
           * autoComplete: "off" para evitar autocompletado del navegador
           */}
          <Form
            form={form}
            name="create-program-form"
            onFinish={onFinish}
            layout="vertical"
            disabled={loading}
            autoComplete="off"
          >
            {/* CAMPO CÓDIGO */}
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ validator: validateCodigo }]} // Reglas de validación
              hasFeedback // Muestra icono de ✓ o ✗ según validación
            >
              <Input
                placeholder="Ejemplo: 09"
                size="large"
                maxLength={10}
                showCount // Muestra contador de caracteres
              />
            </Form.Item>

            {/* CAMPO NOMBRE */}
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ validator: validateNombre }]}
              hasFeedback
            >
              <Input
                placeholder="Ejemplo: Ingeniería de Software"
                size="large"
                maxLength={150}
                showCount
              />
            </Form.Item>

            {/* CAMPO FACULTAD (Dropdown) */}
            <Form.Item
              name="facultad"
              label="Facultad"
              rules={[
                { required: true, message: "Por favor selecciona la facultad" },
              ]}
              hasFeedback
            >
              <Select
                placeholder="Selecciona una facultad"
                size="large"
                showSearch // Permitir búsqueda en el dropdown
                optionFilterProp="children"
                filterOption={(input, option) =>
                  // Filtrar opciones por texto ingresado
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) ?? false
                }
              >
                {facultades.map((facultad) => (
                  <Option key={facultad} value={facultad}>
                    {facultad}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* BOTÓN GUARDAR */}
            <Form.Item>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </Form.Item>

            {/* BOTÓN VOLVER */}
            <Form.Item>
              <Button
                variant="ghost"
                onClick={() => navigate("/programs")}
                size="medium"
                disabled={loading}
              >
                ← Volver a lista de programas
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Footer />

      {/* MODALES */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={handleCancel}
      />

      <ConfirmModal
        open={confirm.open}
        message={`¿Deseas reactivar el programa "${confirm.nombre}"?`}
        onConfirm={() => {
          message.info("Funcionalidad de reactivación no implementada");
          handleCancel();
        }}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateProgram;
