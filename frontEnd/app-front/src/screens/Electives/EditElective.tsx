// src/screens/Electives/EditElective.tsx
import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate, useParams } from "react-router";
import { useElectiveStore } from "../../store/electiveStore";
import type { IElective } from "../../Models/elective";

const EditElective: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { codigo } = useParams<{ codigo: string }>();

  const electives = useElectiveStore((state) => state.electives);
  const updateElective = useElectiveStore((state) => state.updateElective);

  // cargar datos de la electiva seleccionada
  useEffect(() => {
    const elective = electives.find((e) => e.codigo === codigo);
    if (elective) {
      form.setFieldsValue(elective);
    }
  }, [codigo, electives, form]);

  // cancelar edición
  const handleCancel = () => {
    navigate("/electives");
  };

  // guardar cambios
  const onFinish = (values: IElective) => {
    try {
      updateElective(values.codigo, values);
      message.success("Electiva actualizada correctamente");
      navigate("/electives");
    } catch (error) {
      message.error("Error al actualizar la electiva");
      console.error(error);
    }
  };

  return (
    <div className="login-form-container">
      <Header />
      <div className="login-content">
        <div className="login-card">
          <Button onClick={handleCancel} style={{ marginBottom: 16 }} block>
            ← Volver a lista de electivas
          </Button>

          <h2 className="login-title">Editar Electiva</h2>

          <Form
            form={form}
            className="login-form"
            name="edit-elective-form"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item name="codigo" label="Código">
              <Input disabled size="large" />
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
                Guardar cambios
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditElective;
