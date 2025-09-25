import './CreateProgram.css';
import React, { useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { useNavigate } from 'react-router';
import { useProgramStore } from '../../../store/programStore';
import { Form, Input, Button, Select, Modal } from 'antd';
import Navbar from '../../../components/Navbar/Navbar';
import WarningModal from '../../../components/WarningModal/WarningModal';

const CreateProgramForm: React.FC = () => {
    const navigate = useNavigate();
    const createAndAddProgram = useProgramStore(state => state.createAndAddProgram);

    // Estado para el modal de advertencia (errores)
    const [warning, setWarning] = useState<{ open: boolean; message: string }>({
        open: false,
        message: "",
    });

    // Estado para el modal de éxito
    const [success, setSuccess] = useState(false);

    const handleBack = () => {
        navigate('/programs');
    };

    const onFinish = async (values: any) => {
        try {
            await createAndAddProgram({
                codigo: values.programCode,
                nombre: values.programName,
                facultad: values.facultad
            });
            setSuccess(true); // Muestra modal de éxito
        } catch (error) {
            setWarning({
                open: true,
                message: "Error al crear el programa. Por favor, intenta de nuevo.",
            });
            console.error("CreateProgram. Error: ", error);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        setWarning({
            open: true,
            message: "Por favor completa todos los campos obligatorios.",
        });
    };

    const { Option } = Select;

    const facultades = [
        'Facultad de Ingeniería Electrónica y de Telecomunicaciones'
    ];

    return (
        <div className="create-program-container">
            <Header />
            <Navbar />
            <div className="create-program-content">
                <div className="create-program-card">
                    <Button onClick={handleBack} style={{ marginBottom: 16 }} block>
                        ← Volver a la lista de programas
                    </Button>
                    <h2 className="create-program-title">Crear Nuevo Programa</h2>
                    <Form
                        className="create-program-form"
                        name="create-program-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            name="programCode"
                            rules={[{ required: true, message: 'Por favor ingrese el código del programa' }]}
                        >
                            <Input placeholder="Código del Programa" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="programName"
                            rules={[{ required: true, message: 'Por favor ingrese el nombre del programa' }]}
                        >
                            <Input placeholder="Nombre del Programa" size="large" />
                        </Form.Item>

                        <Form.Item
                            name='facultad'
                            rules={[{ required: true, message: 'Por favor ingrese la facultad del programa' }]}
                        >
                            <Select placeholder="Selecciona la Facultad" size="large">
                                {facultades.map((facultad) => (
                                    <Option key={facultad} value={facultad}>
                                        {facultad}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large">
                                Crear Programa
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <Footer />

            {/* Modal de advertencia */}
            <WarningModal
                open={warning.open}
                message={warning.message}
                onClose={() => setWarning({ open: false, message: "" })}
            />

            {/* Modal de éxito */}
            <Modal
                open={success}
                onOk={() => {
                    setSuccess(false);
                    navigate('/programs');
                }}
                onCancel={() => setSuccess(false)}
                okText="Ir a la lista"
                cancelButtonProps={{ style: { display: "none" } }}
                centered
            >
                <p>¡Programa creado exitosamente!</p>
            </Modal>
        </div>
    );
}

export default CreateProgramForm;