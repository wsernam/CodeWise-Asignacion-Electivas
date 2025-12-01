import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./AssignmentModule.css";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import SimpleModal from "../../components/shared/SimpleModal/SimpleModal";
import CreateAssignmentProcess from "./Steps/CreateProcess/CreateAssignmentProcess";
import UploadFilesAP from "./Steps/FirstStep/UploadFilesAP";
import InactivesManagementAP from "./Steps/SecondStep/InactivesManagementAP";
import LevelsManagementAP from "./Steps/ThirdStep/LevelsManagementAP";
import AssignmentManagementAP from "./Steps/FourStep/AssignmentManagementAP";
import TooltipInfo from "../../components/ui/TooltipInfo/TooltipInfo";
import { useAssignmentProcessStore } from "../../store/Assignment";

type ProcessData = {
  year: number;
  semester: 1 | 2;
};

// Tipo temporal para el historial de procesos
interface ProcessHistory {
  pa_codigo: number;
  pa_anio: number;
  pa_num_semestre: number;
  pa_activo: boolean;
  fechaFinalizacion?: string;
}

const AssignmentModule: React.FC = () => {
  // Estados para el manejo de modales
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [hasActiveProcess, setHasActiveProcess] = useState<boolean>(false);
  const [currentStepLocal, setCurrentStepLocal] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const navigate = useNavigate();
  // Helpers para persistir paso por roceso
  const storageKeyForProcess = (codigo: number) =>
    `assignment_process_${codigo}_current_step`;

  const loadPersistedState = (codigo: number) => {
    try {
      const raw = localStorage.getItem(storageKeyForProcess(codigo));
      if (!raw) return null;
      return JSON.parse(raw) as {
        currentStepLocal?: number;
        completedSteps?: number[];
      };
    } catch {
      return null;
    }
  };

  const savePersistedState = (
    codigo: number,
    step: number | null,
    completed: number[]
  ) => {
    try {
      localStorage.setItem(
        storageKeyForProcess(codigo),
        JSON.stringify({ currentStepLocal: step, completedSteps: completed })
      );
    } catch {
      // No hacer nada
    }
  };

  // Estados para el manejo del proceso
  const { finalizarProceso, eliminarProceso } = useAssignmentProcessStore();
  const {
    obtenerProcesoActivo,
    obtenerTodosLosProcesos,
    currentProcess,
    allProcess,
  } = useAssignmentProcessStore();

  // Manejadores
  const handleProcessCreated = (year: number, semester: 1 | 2) => {
    setShowCreateModal(false);
    setCompletedSteps([]);
    setProcessData({ year, semester });
  };

  const handleCancelProcess = () => {
    setHasActiveProcess(false);
    setCurrentStepLocal(null);
    setCompletedSteps([]);
    setProcessData(null);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (!currentProcess) return;
    try {
      await eliminarProceso(currentProcess.pa_codigo);
      handleCancelProcess();
      try {
        localStorage.removeItem(storageKeyForProcess(currentProcess.pa_codigo));
      } catch {}
    } catch (error) {
      console.error("Error eliminando proceso:", error);
      throw error;
    }
  };

  const handleDeleteProcess = () => {
    if (currentProcess) {
      setShowDeleteConfirm(true);
    }
  };

  const handleNextStep = () => {
    if (currentStepLocal) {
      // Marcar actual como completado
      setCompletedSteps((prev) => [...new Set([...prev, currentStepLocal])]);
      // Avanzar automáticamente al siguiente
      const nextStep = currentStepLocal + 1;
      setCurrentStepLocal(nextStep);
      if (currentProcess?.pa_codigo) {
        savePersistedState(currentProcess.pa_codigo, nextStep, [
          ...new Set([...completedSteps, currentStepLocal]),
        ]);
      }
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // SOLO permitir click en el paso actual
    if (stepNumber === currentStepLocal) {
      console.log(`Navegando al paso actual: ${stepNumber}`);
    }
  };

  const getStepBorderClass = (stepNumber: number) => {
    return completedSteps.includes(stepNumber) ? "green" : "red";
  };

  const handleFinalizeProcess = async () => {
    if (currentProcess) {
      try {
        await finalizarProceso(currentProcess.pa_codigo);
        await obtenerTodosLosProcesos();
      } catch (error) {
        console.error("Error finalizando proceso:", error);
      }
    }
  };

  const handleSeeReport = () => {
    handleFinalizeProcess();
    navigate("/reports-assignment");
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
    return statusMap[currentStepLocal as keyof typeof statusMap] || "Creado";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  // Efecto solo para cargar proceso activo el iniciar
  useEffect(() => {
    const cargarProcesos = async () => {
      try {
        await obtenerProcesoActivo();
        await obtenerTodosLosProcesos();
      } catch (error) {
        console.error("Error al obtener proceso activo:", error);
        console.error("Error al obtener todos los procesos:", error);
      }
    };
    cargarProcesos();
  }, [obtenerProcesoActivo, obtenerTodosLosProcesos]);

  // Efecto para sincronizar si hay proceso activo
  useEffect(() => {
    if (currentProcess) {
      setHasActiveProcess(true);

      // Cargar estado persistido
      const persisted = loadPersistedState(currentProcess.pa_codigo);

      if (persisted?.currentStepLocal) {
        setCurrentStepLocal(persisted.currentStepLocal);
        setCompletedSteps(persisted.completedSteps ?? []);
      } else {
        // Por defecto inicia en 1
        setCurrentStepLocal(1);
        setCompletedSteps([]);
        savePersistedState(currentProcess.pa_codigo, 1, []);
      }
      setProcessData({
        year: currentProcess.pa_anio,
        semester: currentProcess.pa_num_semestre,
      });
    } else {
      setHasActiveProcess(false);
      setCurrentStepLocal(null);
      setCompletedSteps([]);
      setProcessData(null);
    }
  }, [currentProcess]);

  // Debug del estado actual
  useEffect(() => {
    console.log("Debug - Estado actual:");
    console.log("currentStepLocal:", currentStepLocal);
    console.log("completedSteps:", completedSteps);
    console.log("hasActiveProcess:", hasActiveProcess);
  }, [currentStepLocal, completedSteps, hasActiveProcess]);

  return (
    <>
      <div className="assignment-page-container">
        <div className="form-page-content">
          <Card className="main-card assignment-card">
            <div className="assignment-tooltip-wrapper">
              <TooltipInfo
                symbol="!"
                title={hasActiveProcess ? "Tener en cuenta" : "Importante"}
                description={
                  hasActiveProcess ? (
                    <>
                      <strong>Cargar Archivos: </strong>
                      se reciben archivos en formato excel (.xlsx) con la
                      información de los estudiantes.
                      <br />
                      <strong>Gestión de Potenciales Inactivos: </strong>
                      se permite completar los datos de quienes tengan
                      información faltante, o no incluirlos en la asignación.
                      <br />
                      <strong>Gestión de Potenciales Nivelados: </strong>
                      se verifica qué estudientes pasan el filtro de nivelación
                      para ver electivas.
                      <br />
                      <strong>Asignación: </strong>
                      se confirma de la asignación automática.
                      <br />
                    </>
                  ) : (
                    <>
                      <strong>Antes de comenzar:</strong>
                      <br />
                      • Debe tener los datos de estudiantes que coincidan con el
                      formulario de inscripción.
                      <br />
                      • Verifique que no haya datos incompletos, o tenga cerca
                      la información.
                      <br />•{" "}
                      <strong>
                        Una vez iniciado, no podrá volver entre pasos.
                      </strong>
                      <br />• Asegúrese de proceder con cuidado.
                    </>
                  )
                }
                position="left"
              />
            </div>
            {!hasActiveProcess ? (
              <div className="no-process-container">
                <div className="info-icon"></div>
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
                    onClick={handleDeleteProcess}
                    disabled={getProcessStatus() === "Finalizado"}
                  >
                    Eliminar Proceso
                  </Button>
                </div>

                {currentStepLocal === 1 && (
                  <UploadFilesAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={1}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStepLocal === 2 && (
                  <InactivesManagementAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={2}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStepLocal === 3 && (
                  <LevelsManagementAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={3}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStepLocal === 4 && (
                  <AssignmentManagementAP
                    onNext={handleNextStep}
                    onCancel={handleCancelProcess}
                    onStepClick={handleStepClick}
                    currentStep={4}
                    completedSteps={completedSteps}
                    getStepBorderClass={getStepBorderClass}
                  />
                )}

                {currentStepLocal === 5 && (
                  <div className="final-step-actions">
                    <p>Los datos fueron guardados correctamente.</p>
                    <div className="final-buttons">
                      <Button
                        variant="primary"
                        className="view-assignment-btn"
                        onClick={handleFinalizeProcess}
                      >
                        Finalizar Proceso
                      </Button>
                      <Button variant="secondary" onClick={handleSeeReport}>
                        Ver asignación
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          <div className="divider"></div>

          <Card className="main-card history-card">
            <h3 className="history-title">Últimos procesos de Asignación</h3>

            {/* Proceso en curso */}
            {hasActiveProcess && processData && (
              <div className="process-history-item">
                <div className="process-period">
                  {processData.year}-{processData.semester}
                </div>
                <div className="process-details">
                  <div className="process-date"></div>
                  <span className="status">En Proceso</span>
                </div>
              </div>
            )}

            {/* Procesos finalizados desde el backend */}
            {allProcess &&
              (allProcess as ProcessHistory[])
                .filter(
                  (proceso) =>
                    !proceso.pa_activo &&
                    proceso.pa_codigo !== currentProcess?.pa_codigo
                )
                .map((proceso) => (
                  <div key={proceso.pa_codigo} className="process-history-item">
                    <div className="process-period">
                      {proceso.pa_anio}-{proceso.pa_num_semestre}
                    </div>
                    <div className="process-details">
                      <div className="process-date">
                        Finalizado en:{" "}
                        {proceso.fechaFinalizacion
                          ? formatDate(proceso.fechaFinalizacion)
                          : "Fecha no disponible"}
                      </div>
                      <span className="status-finished">Finalizado</span>
                    </div>
                  </div>
                ))}
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

      <SimpleModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Eliminación"
      >
        <div style={{ minWidth: "360" }}>
          <p>
            ¿Está seguro de eliminar el proceso de asignación activo? Esta
            acción no se puede deshacer
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <Button
              variant="primary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </SimpleModal>
    </>
  );
};

export default AssignmentModule;
