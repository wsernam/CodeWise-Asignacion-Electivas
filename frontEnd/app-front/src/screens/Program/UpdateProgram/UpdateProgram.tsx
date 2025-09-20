import './UpdateProgram.css';
import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { useNavigate, useParams } from 'react-router';
import { useProgramStore } from '../../../store/programStore';

import { Form, Input, Button, message, Select, Modal } from 'antd';

const UpdateProgramForm: React.FC = () => {
    const navigate = useNavigate();
    const { codigo } = useParams();
    const programs = useProgramStore(state => state.programs);
    const updateAndReplaceProgram = useProgramStore(state => state.updateAndReplaceProgram);
    const deactivateAndRemoveProgram = useProgramStore(state => state.deactivateAndRemoveProgram)

    const program = programs.find(p => p.codigo === codigo);

    React.useEffect(() => {
        if (!program) {
            message.error('Programa no encontrado');
            navigate('/programs');
        }
    }, [program, navigate]);

    // Funciones para el manejo del envio del formulario
    const onFinish = async (values: any) => {
        try {
            await updateAndReplaceProgram({
                codigo: values.programCode,
                nombre: values.programName,
                facultad: values.facultad
            });
            message.success('Programa actualizado exitosamente');
            navigate('/programs'); // Redirecciona a la lista de programas
        } catch (error) {
            message.error('Error al actualizar el programa');
            console.error("UpdateProgram. Error: ", error);
        }

    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    }

    // Select de facultades
    const { Option } = Select;

    const facultades = [
        'Facultad de Ingeniería Electrónica y de Telecomunicaciones'
    ];

    // Función para manejar el botón de volver
    const handleBack = () => {
        navigate('/programs'); // Redirecciona a la lista de programas
    };

    // Funcion para manejar el boton de desactivar
    const handleDeactive = () => {
        Modal.confirm({
            title: 'Confirmar desactivación',
            content: '¿Estás seguro de que deseas desactivar este programa?',
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deactivateAndRemoveProgram(codigo!);
                    message.success('Programa desactivado exitosamente');
                    navigate('/programs'); // Redirecciona a la lista de programas
                } catch (error) {
                    message.error('Error al desactivar el programa');
                    console.error("UpdateProgram. Error: ", error);
                }
            },
        });
    };


    return (
        <div className="update-program-container">
            <Header />
            <div className="update-program-content">
                <div className="update-program-card">
                    <Button onClick={handleBack} style={{ marginBottom: 16 }} block>
                        ← Volver a la lista de programas
                    </Button>
                    <h2 className="update-program-title">Actualizar programa</h2>
                    <Form
                        className="update-program-form"
                        name="update-program-form"
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
                                Actualizar Programa
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button htmlType='button' danger block size="large" onClick={() => handleDeactive()}>
                                Desactivar
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default UpdateProgramForm;