import React from 'react';
import { useNavigate } from 'react-router';
import './LoginStudent.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';


import { loginStudentService } from '../../services/authService';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';


const LoginStudent: React.FC = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/');
    };

    const onFinish = async (values: any) => {
        try {
            const result = await loginStudentService(values.username);
            message.success('Inicio de sesión exitoso');
            console.log("LoginStudent. Respuesta del backend: ", result);
        } catch (error) {
            message.error('Error en el inicio de sesión');
            console.error("LoginStudent. Error: ", error);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login-student-form-container">
            <Header />
            <div className="login-student-content">
                <div className="login-student-card">
                    <Button onClick={handleBack} style={{ marginBottom: 16 }} block>
                        ← Volver a selección de rol
                    </Button>
                    <h2 className="login-student-title">Iniciar sesión Estudiante</h2>
                    <Form
                        className="login-student-form"
                        name="login-student-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Por favor ingresa tu usuario!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Usuario" size="large" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large">
                                Consultar
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LoginStudent;
