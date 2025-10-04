import React, { useEffect, useState } from "react";
import { Form, Input, message, Select } from "antd";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useNavigate, useParams } from "react-router"; // Hook para parámetros URL
import { useProgramStore } from "../../store/programStore";
import type { Program } from "../../models/program";

const { Option } = Select;

const EditProgram: React.FC = () => {
  // ========== HOOKS Y ESTADO ==========
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // useParams obtiene los parámetros de la URL (/edit/:codigo)
  const { codigo } = useParams<{ codigo: string }>();

  // Extraer datos y funciones del store
  const programs = useProgramStore((state) => state.programs);
  const updateProgram = useProgramStore((state) => state.updateProgram);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);

  const [loading, setLoading] = useState(false);
  const [programFound, setProgramFound] = useState(false);

  // ========== DATOS ESTÁTICOS ==========
  const facultades = [
    "Facultad de Ingeniería Electrónica y de Telecomunicaciones",
    "Facultad de Ingeniería Civil",
    "Facultad de Ciencias Naturales y Exactas",
  ];

  // ========== EFFECTS (CICLO DE VIDA) ==========

  /**
   * useEffect 1: Cargar programas si no están disponibles
   * Se ejecuta cuando el componente se monta o cuando cambian las dependencias
   */
  useEffect(() => {
    if (programs.length === 0) {
      fetchPrograms(); // Cargar datos del store
    }
  }, [fetchPrograms, programs.length]);

  /**
   * useEffect 2: Cargar datos del programa a editar
   * Se ejecuta cuando tenemos el código de la URL y los programas cargados
   */
  useEffect(() => {
    if (codigo && programs.length > 0) {
      // Buscar el programa por código y que esté activo
      const program = programs.find(
        (p) => p.codigo === codigo && p.active !== false
      );

      if (program) {
        // Llenar el formulario con los datos existentes
        form.setFieldsValue({
          codigo: program.codigo,
          nombre: program.nombre,
          facultad: program.facultad,
        });
        setProgramFound(true); // Marcar que encontramos el programa
      } else {
        message.error("Programa no encontrado o está inactivo");
        navigate("/programs"); // Redirigir si no existe
      }
    }
  }, [codigo, programs, form, navigate]);

  // ========== VALIDACIONES ==========

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

    // Validación especial: no permitir nombres duplicados
    const existingProgram = programs.find(
      (p) =>
        p.nombre.toLowerCase() === value.toLowerCase() &&
        p.codigo !== codigo && // Excluir el programa actual
        p.active !== false
    );
    if (existingProgram) {
      return Promise.reject(
        `Ya existe un programa activo con el nombre "${value}"`
      );
    }

    return Promise.resolve();
  };

  // ========== MANEJADORES ==========

  const handleCancel = () => {
    navigate("/programs");
  };

  const onFinish = async (values: Program) => {
    if (!codigo) return; // Seguridad: si no hay código, no hacer nada

    setLoading(true);
    try {
      // Preparar datos para actualizar
      const cleanedValues = {
        ...values,
        codigo: codigo, // Mantener el código original (no editable)
        nombre: values.nombre.trim().replace(/\s+/g, " "),
        active: true,
      };

      // Actualizar en el store
      await updateProgram(codigo, cleanedValues);
      message.success("Programa actualizado correctamente");
      navigate("/programs");
    } catch (error: any) {
      console.error("Error al actualizar programa:", error);

      // Manejo específico de errores
      if (error.message === "NAME_EXISTS" && error.existing) {
        message.error(
          `Ya existe un programa activo con el nombre "${values.nombre}"`
        );
      } else if (error.message === "NOT_FOUND") {
        message.error("Programa no encontrado");
      } else {
        message.error("Error al actualizar el programa");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDERIZADO CONDICIONAL ==========

  // Si no encontramos el programa (y ya cargamos los datos)
  if (!programFound && programs.length > 0) {
    return (
      <div className="auth-page">
        <Header />
        <Navbar />
        <div className="auth-page-content">
          <Card padding="xl">
            <h2>Programa no encontrado</h2>
            <p>El programa que intentas editar no existe o está inactivo.</p>
            <Button variant="primary" onClick={() => navigate("/programs")}>
              ← Volver a lista de programas
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // ========== RENDERIZADO PRINCIPAL ==========
  return (
    <div className="auth-page">
      <Header />
      <Navbar />

      <div className="auth-page-content">
        <Card padding="xl">
          <h2>Editar Programa</h2>

          <Form
            form={form}
            name="edit-program-form"
            onFinish={onFinish}
            layout="vertical"
            disabled={loading}
            autoComplete="off"
          >
            {/* Código (solo lectura) */}
            <Form.Item name="codigo" label="Código del Programa">
              <Input
                disabled // No editable
                size="large"
                style={{ backgroundColor: "#f5f5f5", color: "#666" }} // Estilo visual para disabled
              />
            </Form.Item>

            {/* Nombre (editable) */}
            <Form.Item
              name="nombre"
              label="Nombre del Programa"
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

            {/* Facultad (editable) */}
            <Form.Item
              name="facultad"
              label="Facultad"
              rules={[
                { required: true, message: "Por favor selecciona la facultad" },
              ]}
              hasFeedback
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
              >
                {facultades.map((facultad) => (
                  <Option key={facultad} value={facultad}>
                    {facultad}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Botones de acción */}
            <Form.Item>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="back-button"
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
    </div>
  );
};

export default EditProgram;
