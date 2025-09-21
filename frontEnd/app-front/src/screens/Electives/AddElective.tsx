// src/screens/Electives/AddElective.tsx
import React from "react";
import { Form, Input, Button, message } from "antd";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router";
import { useElectiveStore } from "../../store/electiveStore"; // 👈 nuestra store
import type { IElective } from "../../Models/elective"; // 👈 modelo

const AddElective: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const addElective = useElectiveStore((state) => state.addElective); // 👈 obtenemos acción

  // Cancelar y volver a la lista de electivas
  const handleCancel = () => {
    navigate("/electives");
  };

  // Guardar nueva electiva
  const onFinish = (values: IElective) => {
    try {
      addElective(values); // 👈 lo agregamos al store
      message.success("Electiva agregada correctamente");
      form.resetFields(); // limpiamos formulario
      navigate("/electives"); // redirigimos a la lista
    } catch (error) {
      message.error("Error al agregar la electiva");
      console.error(error);
    }
  };

  return (
    <div className="login-form-container">
      {/* Reusamos la misma estructura del login */}
      <Header />
      <div className="login-content">
        <div className="login-card">
          {/* Botón volver */}
          <Button onClick={handleCancel} style={{ marginBottom: 16 }} block>
            ← Volver a lista de electivas
          </Button>

          <h2 className="login-title">Agregar Nueva Electiva</h2>

          <Form
            form={form}
            className="login-form"
            name="add-elective-form"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ required: true, message: "Por favor ingresa el código" }]}
            >
              <Input placeholder="Ejemplo: 04" size="large" />
            </Form.Item>

            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
            >
              <Input placeholder="Ejemplo: Desarrollo Web" size="large" />
            </Form.Item>

            <Form.Item
              name="programa"
              label="Programa"
              rules={[{ required: true, message: "Por favor ingresa el programa" }]}
            >
              <Input placeholder="Ejemplo: Ingeniería de Sistemas" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Guardar
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddElective;
