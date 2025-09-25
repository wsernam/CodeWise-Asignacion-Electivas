import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
// Componentes de la interfaz
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
// Navegación y parámetros de ruta
import { useNavigate, useParams } from "react-router";
// Store de electivas (Zustand)
import { useElectiveStore } from "../../store/electiveStore";
import type { IElective } from "../../Models/elective";
import Navbar from "../../components/Navbar/Navbar";

/**
 * Componente para editar una electiva existente
 */
const EditElective: React.FC = () => {
  const [form] = Form.useForm(); // Formulario controlado por Ant Design
  const navigate = useNavigate();
  const { codigo } = useParams<{ codigo: string }>(); // Código de la electiva desde la URL

  // Accedemos al estado global de electivas y la función de actualización
  const electives = useElectiveStore((state) => state.electives);
  const updateElective = useElectiveStore((state) => state.updateElective);

  /**
   * Al montar el componente o cambiar la lista de electivas,
   * buscamos la electiva por código y rellenamos el formulario
   */
  useEffect(() => {
    const elective = electives.find((e) => e.codigo === codigo);
    if (elective) {
      form.setFieldsValue(elective); // Seteamos los valores del formulario
    }
  }, [codigo, electives, form]);

  // Función para cancelar la edición y volver a la lista
  const handleCancel = () => {
    navigate("/electives");
  };

  /**
   * Función que se ejecuta al enviar el formulario
   * Actualiza la electiva en la store y muestra mensajes de éxito/error
   */
  const onFinish = async (values: IElective) => {
    try {
      await updateElective(values.codigo, values);
      message.success("Electiva actualizada correctamente");
      navigate("/electives"); // Volvemos a la lista
    } catch (error) {
      message.error("Error al actualizar la electiva");
      console.error(error);
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

          <h2 className="login-title">Editar Electiva</h2>

          {/* Formulario de edición */}
          <Form
            form={form}
            className="login-form"
            name="edit-elective-form"
            onFinish={onFinish}
            layout="vertical"
          >
            {/* Código: no editable */}
            <Form.Item name="codigo" label="Código">
              <Input disabled size="large" />
            </Form.Item>

            {/* Nombre de la electiva */}
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                { required: true, message: "Por favor ingresa el nombre" },
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
              ]}
            >
              <Input
                placeholder="Ejemplo: Ingeniería de Sistemas"
                size="large"
              />
            </Form.Item>

            {/* Botón para guardar cambios */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Guardar cambios
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Pie de página */}
      <Footer />
    </div>
  );
};

export default EditElective;
