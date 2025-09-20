import './CreateProgram.css';
import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { useNavigate } from 'react-router';
import { useProgramStore } from '../../../store/programStore';

import { Form, Input, Button, message, Select } from 'antd';

const CreateProgramForm: React.FC = () => {
    const navigate = useNavigate();
    const createAndAddProgram = useProgramStore(state => state.createAndAddProgram);

    const handleBack = () => {
        navigate('/programs'); // Redirecciona a la lista de programas
    };

    const onFinish = async (values: any) => {
        try{
            await createAndAddProgram({
                codigo: values.programCode,
                nombre: values.programName,
                facultad: values.facultad
            });
            message.success('Programa creado exitosamente');
            navigate('/programs'); // Redirecciona a la lista de programas
        } catch(error) {
            message.error('Error al crear el programa');
            console.error("CreateProgram. Error: ", error);
        }
        
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    }

    const { Option } = Select;

    const facultades = [
        'Facultad de Ingeniería Electrónica y de Telecomunicaciones'
    ];

    return (
        <div className="create-program-container">
            <Header />
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
        </div>
    );
}

export default CreateProgramForm;