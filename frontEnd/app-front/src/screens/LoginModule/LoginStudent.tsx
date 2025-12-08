import React from "react";
import { useNavigate } from "react-router";
import { Form, Input, message } from "antd";
import { UserOutlined } from "@ant-design/icons";

// Componentes reutilizables
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";

// Servicio de autenticación
import { useStudentStore } from "../../store/Form/studentStore";

const LoginStudent: React.FC = () => {
  const navigate = useNavigate();
  const { getStudentById } = useStudentStore();

  const validateCodigo = (value: string) => {
    if (!value) return "Por favor ingresa el código";
    if (!/^\d+$/.test(value)) return "El código debe contener solo números";
    return null;
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleLogin = async (values: { code: string }) => {
    try {
      const code = parseInt(values.code);
      const student = await getStudentById(code);

      if (student) {
        const studentState = {
          codigo: student.est_codigo,
          email: student.est_correo,
          nombre: student.est_nombre,
          apellido: student.est_apellido,
          programa: student.pro_codigo,
        };
        navigate("/elective-selection", { state: studentState });
      } else {
        navigate("/personal-info", { state: { codigo: code } });
      }
    } catch (err) {
      message.error("Error en el inicio de sesión del estudiante");
      console.error("[LoginStudent] Error en loginStudent: ", err);
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <div className="auth-page-content">
        <Card padding="xl" maxWidth="400px">
          <h2>Iniciar sesión Estudiante</h2>

          <Form
            name="login-student-form"
            onFinish={handleLogin}
            style={{ width: "100%" }}
          >
            <Form.Item
              name="code"
              rules={[
                {
                  validator: (_, value) => {
                    const error = validateCodigo(value);
                    return error
                      ? Promise.reject(new Error(error))
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Código estudiante"
                size="large"
              />
            </Form.Item>

            {/* Botones en la misma fila - MISMA SOLUCIÓN */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginTop: "2rem",
              }}
            >
              <Button
                type="button"
                onClick={handleBack}
                size="large"
                variant="ghost"
              >
                Volver
              </Button>

              <Button type="submit" variant="primary" size="large">
                Consultar
              </Button>
            </div>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default LoginStudent;
