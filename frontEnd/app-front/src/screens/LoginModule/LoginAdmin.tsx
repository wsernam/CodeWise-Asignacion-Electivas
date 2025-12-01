import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Form, Input, message, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

// Componentes reutilizables
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import BackButton from "../../components/ui/BackButton/BackButton";

// Store de autenticación
import { useAuthStore } from "../../store/Auth/authStore";

/**
 * COMPONENTE: Login (Administrativo)
 * Login completo con usuario y contraseña para personal administrativo
 * Incluye validaciones y manejo de errores robusto
 */
const LoginAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin, loading, error } = useAuthStore();
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
      // Autenticar
      await loginAdmin(values.username, values.password);
      // Éxito en autenticación
      message.success("Inicio de sesión exitoso");
      // Se obtiene el rol desde el store
      const { role } = useAuthStore.getState();

      if (role) {
        switch (role) {
          case "asignador":
            navigate("/assignment-module");
            break;
          case "administrador":
            navigate("/dashboard");
            break;
          case "ambos":
            navigate("/dashboard");
            break;
          default:
            // Si el rol no es reconocido, redirigir a una página por defecto
            navigate("/");
        }
      }
    } catch (error) {
      // Error en autenticación
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
            {/* 
              Sección para mostrar el mensaje de error.
              El componente Alert de Ant Design incluye un ícono por defecto.
            */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => (useAuthStore.getState().error = null)}
                style={{ marginBottom: "1rem" }}
              />
            )}

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
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </Form.Item>

            {/* Botón volver */}
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

export default LoginAdmin;
