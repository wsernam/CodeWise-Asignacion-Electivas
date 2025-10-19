import React from "react";
import { useNavigate } from "react-router";
import { Form, Input, message } from "antd";
import { UserOutlined } from "@ant-design/icons"; // Iconos de Ant Design

// Componentes reutilizables de nuestra aplicación
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import BackButton from "../../components/ui/BackButton/BackButton";

// Servicio de autenticación
import { useStudentStore } from "../../store/studentStore";
import { useAuthStore } from "../../store/authStore";

const LoginStudent: React.FC = () => {
  const navigate = useNavigate();
  const { loginStudent, role, error } = useAuthStore();

  /**
   * handleBack - Navegar de vuelta a la selección de roles
   * Se usa cuando el usuario hace clic en "Volver"
   */
  const handleBack = () => {
    navigate("/"); // Navega a la ruta raíz (PreLogin)
  };

  /**
   * handleLogin - Manejar envío del formulario
   * Se ejecuta cuando el formulario pasa todas las validaciones
   * @param values - Objeto con los valores del formulario { username }
   */
  const handleLogin = async (values: { code: string }) => {
   
    
    /* Realiza el login del estudiante usando el store de autenticación */
    try {
      const code = values.code;
      await loginStudent(code);
      if (role === "estudiante") navigate("/elective-selection");
    }
    catch (err) {
      message.error("Error en el inicio de sesión del estudiante");
      console.error("[LoginStudent] Error en loginStudent: ", err);
    }
  };

  return (
    <div className="auth-page">
      {" "}
      {/* Contenedor principal con clases de layout */}
      <Header />
      {/* Contenedor del contenido de autenticación */}
      <div className="auth-page-content">
        {" "}
        {/* Centra el contenido vertical y horizontalmente */}
        {/* Tarjeta que contiene el formulario */}
        <Card padding="xl" maxWidth="400px">
          <h2>Iniciar sesión Estudiante</h2>

          {/*
           * FORMULARIO DE ANT DESIGN
           * name: identificador único del formulario
           * onFinish: función que se ejecuta al enviar exitosamente
           * style: ancho completo del contenedor
           */}
          <Form
            name="login-student-form"
            onFinish={handleLogin}
            style={{ width: "100%" }}
          >
            {/* Campo de usuario */}
            <Form.Item
              name="code"
              rules={[
                {
                  required: true,
                  message: "Por favor ingresa tu código",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Código estudiante"
                size="large"
              />
            </Form.Item>

            {/* Botón de envío */}
            <Form.Item style={{ marginBottom: "1rem" }}>
              <Button type="submit" variant="primary" size="large">
                Consultar
              </Button>
            </Form.Item>

            {/* Sección del botón volver */}
            <div className="back-button-section">
              <BackButton onClick={handleBack} text="Volver" />
            </div>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default LoginStudent;
