import React, { useState } from "react";
import "./AssignmentModule.css";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import SimpleModal from "../../components/shared/SimpleModal/SimpleModal";
import CreateAssignmentProcess from "./Steps/CreateProcess/CreateAssignmentProcess";
import UploadFilesAP from "./Steps/FirstStep/UploadFilesAP";
import InactivesManagementAP from "./Steps/SecondStep/InactivesManagementAP";
import LevelsManagementAP from "./Steps/ThirdStep/LevelsManagementAP";
import AssignmentManagementAP from "./Steps/FourStep/AssignmentManagementAP";

type ProcessData = {
  year: number;
  semester: 1 | 2;
};

const AssignmentModule: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [hasActiveProcess, setHasActiveProcess] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [processData, setProcessData] = useState<ProcessData | null>(null);

  const handleProcessCreated = (year: number, semester: 1 | 2) => {
    setShowCreateModal(false);
    setHasActiveProcess(true);
    setCurrentStep(1);
    setCompletedSteps([]);
    setProcessData({ year, semester });
  };

  const handleCancelProcess = () => {
    setHasActiveProcess(false);
    setCurrentStep(null);
    setCompletedSteps([]);
    setProcessData(null);
  };

  const handleUndoLastStep = () => {
    if (currentStep && currentStep > 1) {
      const previousStep = currentStep - 1;
      setCurrentStep(previousStep);
      setCompletedSteps((prev) =>
        prev.filter((step) => step !== currentStep - 1)
      );
    } else if (currentStep === 1) {
      handleCancelProcess();
    }
  };

  const handleNextStep = () => {
    const nextStep = currentStep ? currentStep + 1 : 1;
    setCurrentStep(nextStep);

    if (currentStep) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber - 1) || stepNumber === 1) {
      setCurrentStep(stepNumber);
    }
  };

  const getStepBorderClass = (stepNumber: number) => {
    return completedSteps.includes(stepNumber) ? "green" : "red";
  };

  // Estado simple del proceso - SOLO EL NOMBRE
  const getProcessStatus = () => {
    const statusMap = {
      1: "Creado",
      2: "Archivo Cargado",
      3: "Archivo Guardado",
      4: "Nivelados Gestionados",
      5: "Asignaciones Completadas",
    };
    return statusMap[currentStep as keyof typeof statusMap] || "Creado";
  };

  return (
    <>
      <div className="assignment-page-container">
        <div className="form-page-content">
          <Card className="main-card assignment-card">
            {!hasActiveProcess ? (
              <div className="no-process-container">
                <div className="info-icon">⚠️</div>
                <h3>No hay procesos de asignación activos</h3>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="create-btn"
                >
                  Crear
                </Button>
              </div>
            ) : (
              <>
                <div className="simple-process-header">
                  <div className="process-title-section">
                    <h3>
                      Proceso de asignación {processData?.year}-
                      {processData?.semester}
                    </h3>
                    <span className="process-status">{getProcessStatus()}</span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleUndoLastStep}
                    disabled={currentStep === 1}
                  >
                    Deshacer
                  </Button>
                </div>

                {currentStep === 1 && (
                  <UploadFilesAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={1}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStep === 2 && (
                  <InactivesManagementAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={2}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStep === 3 && (
                  <LevelsManagementAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={3}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStep === 4 && (
                  <AssignmentManagementAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={4}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStep === 5 && (
                  <div className="final-step-actions">
                    <p>Los datos fueron guardados correctamente.</p>
                    <Button variant="primary" className="view-assignment-btn">
                      Ver asignación
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>

          <div className="divider"></div>

          <Card className="main-card history-card">
            <h3 className="history-title">Últimos procesos de Asignación</h3>
            <div className="process-history-item">
              <div className="process-period">2024-2</div>
              <div className="process-details">
                <div className="process-date">Finalizado en: DD-MM-YYYY</div>
                <span className="status-finished">Finalizado</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SimpleModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Proceso de Asignación"
      >
        <CreateAssignmentProcess
          onCancel={() => setShowCreateModal(false)}
          onNext={handleProcessCreated}
        />
      </SimpleModal>
    </>
  );
};

export default AssignmentModule;
