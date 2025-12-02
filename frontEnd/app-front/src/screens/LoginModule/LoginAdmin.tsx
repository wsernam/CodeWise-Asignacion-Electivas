import React from "react";
import { useNavigate } from "react-router";
import { Form, Input, message, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

// Componentes reutilizables
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";

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
  };

  return (
    <div className="auth-page">
      <Header />
      <div className="auth-page-content">
        <Card padding="xl" maxWidth="400px">
          <h2>Iniciar sesión</h2>

          <Form
            name="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            style={{ width: "100%" }}
          >
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

            {/* Campo de contraseña */}
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

            {/* Botones en la misma fila - uno a cada lado */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginTop: "2rem",
              }}
            >
              <Button type="button" onClick={handleBack} size="large">
                Volver
              </Button>

              <Button type="submit" variant="primary" size="large">
                Ingresar
              </Button>
            </div>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default LoginAdmin;
