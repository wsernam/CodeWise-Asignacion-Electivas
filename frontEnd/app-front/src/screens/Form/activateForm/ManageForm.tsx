import './ManageForm.css';
import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import Navbar from '../../../components/Navbar/Navbar';
import { useNavigate } from 'react-router';
import { useElectiveStore } from '../../../store/electiveStore';
import { Button, message, DatePicker, Row, Col, Checkbox } from 'antd';
import { useFormStore } from '../../../store/formStore';
import type { FormModel } from '../../../models/formModel';

const { RangePicker } = DatePicker;


const ManageForm: React.FC = () => {

    const navigate = useNavigate();

    // Stores
    const electives = useElectiveStore(state => state.electives);
    const fetchElectives = useElectiveStore(state => state.fetchElectives);

    const forms = useFormStore(state => state.forms);
    const fetchForms = useFormStore(state => state.fetchForms);
    const createAndAddForm = useFormStore(state => state.createAndAddForm);
    const activateAndSetForm = useFormStore(state => state.activateAndSetForm);
    const deactivateAndUnsetForm = useFormStore(state => state.deactivateAndUnsetForm);

    // Estado local
    const [enabled, setEnabled] = useState(false);
    const [dates, setDates] = useState<any>([]);
    const [selected, setSelected] = useState<{ [programa: string]: string[] }>({});

    // Cargar electivas y formularios al montar el componente
    useEffect(() => {
        fetchElectives();
        fetchForms();
    }, [fetchElectives, fetchForms]);

    // Agrupa electivas por programa
    const electivesByProgram = electives.reduce((acc: any, curr) => {
        const prog = curr.programa || 'Sin programa';
        if (!acc[prog]) acc[prog] = [];
        acc[prog].push(curr);
        return acc;
    }, {});

    // Cargar estado de form activo
    useEffect(() => {
        if (forms.length > 0) {
            const activeForm = forms.find(f => f.for_estado);
            if (activeForm) {
                setEnabled(true);
                setDates([activeForm.for_fecha_inicio, activeForm.for_fecha_fin]);
                setSelected(activeForm.electivesByProgram);
            } else {
                setEnabled(false);
            }
        }
    }, [forms]);

    // Cambia el estado del formulario
    const handleToggle = async () => {
        if (forms.length === 0) return;
        const activeForm = forms.find(f => f.for_estado);
        if (activeForm) {
            try{
                await deactivateAndUnsetForm(activeForm.for_codigo);
                setEnabled(false);
                message.info("Formulario deshabilitado");
                console.log("Formulario deshabilitado: ", activeForm);
            } catch (error) {
                message.error("Error al deshabilitar el formulario");
                console.error("Error al deshabilitar el formulario: ", error);
            }
        } else {
            const nuevoForm: FormModel = {
                for_codigo: Date.now(), // Usar timestamp como código único
                for_estado: true,
                for_fecha_inicio: dates[0],
                for_fecha_fin: dates[1],
                electivesByProgram: selected
            };
            try {
                await createAndAddForm(nuevoForm);
                setEnabled(true);
                message.success("Formulario habilitado");
            } catch (error) {
                message.error("Error al habilitar el formulario");
                console.error("Error al habilitar el formulario: ", error);
            }
        }
    };

        // Maneja el cambio de fechas
        const handleDateChange = (values: any) => setDates(values);

        // Maneja el cambio de selección de electivas
        const handleCheckboxChange = (program: string, checkedValues: (string | number)[]) => {
            setSelected(prev => ({
                ...prev,
                [program]: checkedValues as string[]
            }));
        };

        // Guardar la configuración del formulario
        const handleSave = async () => {
            const form: FormModel = {
                for_codigo: Date.now(), // Usar timestamp como código único
                for_estado: enabled,
                for_fecha_inicio: dates[0],
                for_fecha_fin: dates[1],
                electivesByProgram: selected
            };
            try {
                await createAndAddForm(form);
                message.success("Configuración del formulario guardada");
                console.log("Configuración guardada: ", form);
            } catch (error) {
                message.error("Error al guardar la configuración");
                console.error("Error al guardar la configuración: ", error);
            }
        }

        return (
            <>
                <div className='manage-form-container'>
                    <Header />
                    <Navbar />
                    <div className='manage-form-content'>
                        <h1 className='manage-form-header'>Gestión del Formulario de Asignación de Electivas</h1>
                        <div className='manage-form-status-row'>
                            <span>
                                <b>Estado actual:</b> {enabled ? 'Habilitado' : 'Deshabilitado'}
                            </span>
                            <RangePicker
                                onChange={handleDateChange}
                                value={dates}
                                format="DD/MM/YYYY"
                            />
                            <Button type="primary" onClick={handleToggle}>
                                {enabled ? 'Deshabilitar Formulario' : 'Habilitar Formulario'}
                            </Button>
                        </div>
                        <Row className='manage-form-table' gutter={32}>
                            {Object.keys(electivesByProgram).map(program => (
                                <Col xs={24} md={12} key={program}>
                                    <div className='manage-form-program-section'>
                                        <b>{program}</b>
                                        <div className='manage-form-electives-list'>
                                            <span>Electivas:</span>
                                            <Checkbox.Group
                                                value={selected[program] || []}
                                                onChange={(checkedValues) => handleCheckboxChange(program, checkedValues)}
                                            >
                                                {electivesByProgram[program].map((e: any) => (
                                                    <Checkbox key={e.codigo} value={e.codigo}>
                                                        {e.nombre} ({e.codigo})
                                                    </Checkbox>
                                                ))}
                                            </Checkbox.Group>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Button type="primary" size="large" onClick={handleSave}>
                                Guardar Configuración
                            </Button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        )

    }

    export default ManageForm;
