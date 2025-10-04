import React, { useEffect, useState } from "react";
import { Form, Input, message, Select } from "antd";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useNavigate, useParams } from "react-router";

// Stores globales
import { useElectiveStore } from "../../store/electiveStore";
import { useProgramStore } from "../../store/programStore";

// Tipos
import type { IElective } from "../../models/elective";

const { Option } = Select;

const EditElective: React.FC = () => {
  // ========== HOOKS Y ESTADO ==========
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Obtener código de la URL
  const { codigo } = useParams<{ codigo: string }>();

  // Stores
  const electives = useElectiveStore((state) => state.electives);
  const updateElective = useElectiveStore((state) => state.updateElective);
  const fetchElectives = useElectiveStore((state) => state.fetchElectives);

  const programs = useProgramStore((state) => state.programs);
  const fetchPrograms = useProgramStore((state) => state.fetchPrograms);

  const [loading, setLoading] = useState(false);
  const [electiveFound, setElectiveFound] = useState(false);

  // ========== EFFECTS ==========

  /**
   * useEffect 1: Cargar datos iniciales
   * Se ejecuta al montar el componente
   */
  useEffect(() => {
    // Cargar datos si no están disponibles
    if (electives.length === 0) {
      fetchElectives();
    }
    if (programs.length === 0) {
      fetchPrograms();
    }
  }, [fetchElectives, fetchPrograms, electives.length, programs.length]);

  /**
   * useEffect 2: Cargar datos de la electiva a editar
   * Se ejecuta cuando tenemos el código y los datos cargados
   */
  useEffect(() => {
    if (codigo && electives.length > 0) {
      // Buscar la electiva por código y que esté activa
      const elective = electives.find((e) => e.codigo === codigo && e.active);

      if (elective) {
        // Llenar el formulario con los datos actuales
        form.setFieldsValue({
          codigo: elective.codigo,
          nombre: elective.nombre,
          programa: elective.programa,
        });
        setElectiveFound(true);
      } else {
        message.error("Electiva no encontrada o está inactiva");
        navigate("/electives");
      }
    }
  }, [codigo, electives, form, navigate]);

  // ========== VALIDACIONES ==========

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

    // Validación especial: no permitir nombres duplicados
    const existingElective = electives.find(
      (e) =>
        e.nombre.toLowerCase() === value.toLowerCase() &&
        e.codigo !== codigo && // Excluir la electiva actual
        e.active
    );

    if (existingElective) {
      return Promise.reject(
        `Ya existe una electiva activa con el nombre "${value}"`
      );
    }

    return Promise.resolve();
  };

  // ========== MANEJADORES ==========

  const handleCancel = () => {
    navigate("/electives");
  };

  const onFinish = async (values: IElective) => {
    if (!codigo) return; // Seguridad: si no hay código, no hacer nada

    setLoading(true);
    try {
      // Preparar datos para actualizar
      const cleanedValues = {
        ...values,
        codigo: codigo, // Mantener el código original
        nombre: values.nombre.trim().replace(/\s+/g, " "),
        active: true,
      };

      // Actualizar en el store
      await updateElective(codigo, cleanedValues);
      message.success("Electiva actualizada correctamente");
      navigate("/electives");
    } catch (error: any) {
      console.error("Error al actualizar electiva:", error);
      message.error("Error al actualizar la electiva");
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDERIZADO CONDICIONAL ==========

  // Si no encontramos la electiva (pero ya cargamos los datos)
  if (!electiveFound && electives.length > 0) {
    return (
      <div className="auth-page">
        <Header />
        <Navbar />
        <div className="auth-page-content">
          <Card padding="xl">
            <h2>Electiva no encontrada</h2>
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

  // ========== RENDERIZADO PRINCIPAL ==========
  return (
    <div className="auth-page">
      <Header />
      <Navbar />

      <div className="auth-page-content">
        <Card padding="xl">
          <h2>Editar Electiva</h2>

          <Form
            form={form}
            name="edit-elective-form"
            onFinish={onFinish}
            layout="vertical"
            disabled={loading}
            autoComplete="off"
          >
            {/* Código (solo lectura) */}
            <Form.Item name="codigo" label="Código">
              <Input
                disabled
                size="large"
                style={{ backgroundColor: "#f5f5f5", color: "#666" }}
              />
            </Form.Item>

            {/* Nombre (editable) */}
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

            {/* Programa (editable) */}
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
                ← Volver a lista de electivas
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default EditElective;
