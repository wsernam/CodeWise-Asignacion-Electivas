import React from "react";
import { useNavigate } from "react-router";
import { Form, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

// Componentes reutilizables
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import BackButton from "../../components/ui/BackButton/BackButton";

// Servicio de autenticación
import { loginAdminService } from "../../services/authService";

/**
 * COMPONENTE: Login (Administrativo)
 * Login completo con usuario y contraseña para personal administrativo
 * Incluye validaciones y manejo de errores robusto
 */
const LoginAdmin: React.FC = () => {
  const navigate = useNavigate();

  /**
   * handleBack - Volver a la selección de roles
   */
  const handleBack = () => {
    navigate("/");
  };

  /**
   * onFinish - Manejar envío exitoso del formulario
   * @param values - { username: string, password: string }
   */
  const onFinish = async (values: any) => {
    try {
      // Autenticar con el servicio
      const result = await loginAdminService(values.username, values.password);

      // Éxito en autenticación
      message.success("Inicio de sesión exitoso");
      console.log("Login. Respuesta del backend: ", result);

      // En producción aquí:
      // 1. Guardar token de sesión
      // 2. Actualizar contexto de autenticación
      // 3. Redirigir al dashboard administrativo
    } catch (error) {
      // Error en autenticación
      message.error("Error en el inicio de sesión");
      console.error("Login. Error: ", error);
    }
  };

  /**
   * onFinishFailed - Manejar envío fallido del formulario
   * Se ejecuta cuando las validaciones no pasan
   * @param errorInfo - Información detallada de los errores
   */
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    // Podríamos mostrar un mensaje más específico aquí
  };

  return (
    <div className="auth-page">
      {" "}
      {/* Layout de autenticación */}
      <Header />
      <div className="auth-page-content">
        {" "}
        {/* Contenedor centrado */}
        <Card padding="xl" maxWidth="400px">
          <h2>Iniciar sesión</h2>

          {/*
           * FORMULARIO COMPLETO
           * initialValues: valores por defecto
           * onFinish: éxito en validación + envío
           * onFinishFailed: fallo en validación
           */}
          <Form
            name="login-form"
            initialValues={{ remember: true }} // Checkbox "recordarme" (no visible aquí)
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            style={{ width: "100%" }}
          >
            {/* Campo de usuario */}
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Por favor ingresa tu usuario!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Usuario"
                size="large"
              />
            </Form.Item>

            {/* Campo de contraseña (con tipo password) */}
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Por favor ingresa tu contraseña!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña"
                size="large"
              />
            </Form.Item>

            {/* Botón de envío */}
            <Form.Item style={{ marginBottom: "1rem" }}>
              <Button type="submit" variant="primary" size="large">
                Iniciar sesión
              </Button>
            </Form.Item>

            {/* Botón volver */}
            <div className="back-button-section">
              <BackButton
                onClick={handleBack}
                text="Volver a selección de rol"
              />
            </div>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default LoginAdmin;
