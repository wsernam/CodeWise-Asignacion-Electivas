import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
// Componentes de la interfaz
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
// Navegación entre rutas
import { useNavigate } from "react-router";
// Store de electivas
import { useElectiveStore } from "../../store/electiveStore";
import type { IElective } from "../../Models/elective";
// Modales de advertencia y confirmación
import WarningModal from "../../components/WarningModal/WarningModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import Navbar from "../../components/Navbar/Navbar";

/**
 * Componente para agregar una nueva electiva
 * Maneja casos especiales: electiva ya activa o electiva existente pero desactivada
 */
const AddElective: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Funciones de la store
  const addElective = useElectiveStore((state) => state.addElective);
  const reactivateElective = useElectiveStore(
    (state) => state.reactivateElective
  );

  // Estado para controlar modal de advertencia
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Estado para controlar modal de confirmación (reactivar electiva inactiva)
  const [confirm, setConfirm] = useState<{
    open: boolean;
    codigo: string;
    nombre: string;
  }>({
    open: false,
    codigo: "",
    nombre: "",
  });

  // Función para cancelar y volver a la lista de electivas
  const handleCancel = () => {
    navigate("/electives");
  };

  /**
   * onFinish: función que se ejecuta al enviar el formulario
   * Intenta agregar la electiva, maneja errores y casos especiales
   */
  const onFinish = async (values: IElective) => {
    try {
      // Intentamos agregar la electiva
      await addElective({ ...values, active: true });
      message.success("Electiva agregada correctamente");
      form.resetFields();
      navigate("/electives");
    } catch (err: any) {
      // Caso: electiva existe pero está desactivada
      if (err.message === "EXISTS_INACTIVE") {
        setConfirm({
          open: true,
          codigo: err.existing.codigo,
          nombre: err.existing.nombre,
        });
      }
      // Caso: electiva ya existe activa
      else if (err.message === "EXISTS_ACTIVE") {
        setWarning({
          open: true,
          message: `Ya existe la electiva "${err.existing.nombre}", asociada al programa "${err.existing.programa}".`,
        });
      }
      // Otros errores genéricos
      else {
        setWarning({
          open: true,
          message: "Error al agregar la electiva",
        });
      }
    }
  };

  return (
    <div className="login-form-container">
      {/* Encabezado */}
      <Header />
      <Navbar />

      <div className="login-content">
        <div className="login-card">
          {/* Botón para volver a la lista */}
          <Button onClick={handleCancel} style={{ marginBottom: 16 }} block>
            ← Volver a lista de electivas
          </Button>

          <h2 className="login-title">Agregar Nueva Electiva</h2>

          {/* Formulario para agregar electiva */}
          <Form
            form={form}
            className="login-form"
            name="add-elective-form"
            onFinish={onFinish}
            layout="vertical"
          >
            {/* Código de la electiva */}
            <Form.Item
              name="codigo"
              label="Código"
              rules={[
                { required: true, message: "Por favor ingresa el código" },
              ]}
            >
              <Input placeholder="Ejemplo: 04" size="large" />
            </Form.Item>

            {/* Nombre de la electiva */}
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                { required: true, message: "Por favor ingresa el nombre" },
                {
                  validator: (_, value) =>
                    value && /\d/.test(value)
                      ? Promise.reject("El nombre no puede contener números")
                      : Promise.resolve(),
                },
              ]}
            >
              <Input placeholder="Ejemplo: Desarrollo Web" size="large" />
            </Form.Item>

            {/* Programa de la electiva */}
            <Form.Item
              name="programa"
              label="Programa"
              rules={[
                { required: true, message: "Por favor ingresa el programa" },
                {
                  validator: (_, value) =>
                    value && /\d/.test(value)
                      ? Promise.reject("El programa no puede contener números")
                      : Promise.resolve(),
                },
              ]}
            >
              <Input
                placeholder="Ejemplo: Ingeniería de Sistemas"
                size="large"
              />
            </Form.Item>

            {/* Botón para guardar */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Guardar
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Pie de página */}
      <Footer />

      {/* Modal de advertencia */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />

      {/* Modal de confirmación para reactivar electiva inactiva */}
      <ConfirmModal
        open={confirm.open}
        message={`La electiva ${confirm.nombre} ya existe pero está desactivada. ¿Deseas reactivarla?`}
        onConfirm={async () => {
          await reactivateElective(confirm.codigo);
          message.success("Electiva reactivada");
          setConfirm({ open: false, codigo: "", nombre: "" });
          navigate("/electives");
        }}
        onCancel={() => setConfirm({ open: false, codigo: "", nombre: "" })}
      />
    </div>
  );
};

export default AddElective;