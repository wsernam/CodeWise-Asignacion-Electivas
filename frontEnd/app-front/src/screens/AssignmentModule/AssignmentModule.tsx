// screns/student/AssignmentModule.tsx
/**
 * AssignmentModule Screen: Handles the assignment of electives to students.
 */

import React, { useState, useEffect } from "react";

// Styles
import "./AssignmentModule.css";

// UI Components
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";

// Components

import UploadFilesAP from "./Steps/FirstStep/UploadFilesAP";
import SimpleModal from "../../components/shared/SimpleModal/SimpleModal";
import ResumeAssignmetProcess from "./Steps/ResumeAssignmetProcessStep";
import InactivesManagementAP from "./Steps/SecondStep/InactivesManagementAP";

// Stores

//Models


const AssignmentModule: React.FC = () => {

    const [hasActiveProcess, setHasActiveProcess] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number | null>(null); // null = summary
    const [showModal, setShowModal] = useState<boolean>(false);

    // ========== EFECTOS ==========
    useEffect(() => {
        if (hasActiveProcess === false) {
            handleShowSummary();
        }
    }, [hasActiveProcess]);

    // ========== MANEJADORES ==========

    const handleShowSummary = () => setCurrentStep(0);
    const handleStartProcess = () => setCurrentStep(1);
    const handleNextStep = () => setCurrentStep(prev => (prev ? prev + 1 : 1));

    // Si se cancela el proceso, se mantiene en el estado pero cierra el modal
    const handleCancelProcess = () => {
        setShowModal(false);
    };

    // ========== RENDERIZADO ==========

    return (
        <>
            <div className="assignment-page-container">
                <DashboardLayout>
                    <div className="form-page-content">
                        <Card className="main-card">
                            <h2 className="form-title">Módulo de Asignación de Electivas</h2>

                            <div className="divider">
                                <Card className="steps-card">
                                    {/* Control de pasos */}
                                    {currentStep === null && (
                                        <div>
                                            {hasActiveProcess ? (
                                                <div>
                                                    <p>Hay un proceso activo.</p>
                                                    <Button onClick={() => setCurrentStep(1)}> Ver pasos </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Button variant="primary" onClick={handleStartProcess}>
                                                        Crear Proceso
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Resumen del proceso */}
                                    {currentStep === 0 && (
                                        <ResumeAssignmetProcess
                                            onNext={handleNextStep}
                                            onCancel={handleCancelProcess}
                                        />
                                    )}

                                    {/* Proceso de creación */}
                                    {currentStep === 1 && (
                                        <UploadFilesAP
                                            onNext={handleNextStep}
                                            onCancel={handleCancelProcess}
                                        />
                                    )}

                                    {/* Proceso de lectura de archivos*/}
                                    {currentStep === 2 && (
                                        <InactivesManagementAP
                                            onNext={handleNextStep}
                                            onCancel={handleCancelProcess}
                                        />
                                    )}
                                </Card>
                            </div>

                            <div className="divider">
                                <Card className="processes-card">
                                    <h3>Últimos procesos de Asignación</h3>
                                </Card>
                            </div>
                        </Card>
                    </div>
                </DashboardLayout>
            </div>

            <SimpleModal open={showModal} onClose={() => setShowModal(false)} title="Cancelar Paso de Asignación">
                <p>¿Estás seguro de que deseas cancelar el paso actual de asignación?</p>
                <div className="modal-actions">
                    <Button variant="primary" onClick={() => setShowModal(false)}>
                        No, continuar
                    </Button>
                    <Button variant="secondary" onClick={() => {
                        setShowModal(false);
                        setCurrentStep(null); // Regresa al resumen
                    }}>
                        Sí, cancelar
                    </Button>
                </div>

            </SimpleModal>
        </>
    )

};

export default AssignmentModule;