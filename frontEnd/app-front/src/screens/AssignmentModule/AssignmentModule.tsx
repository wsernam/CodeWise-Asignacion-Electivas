import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./AssignmentModule.css";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import SimpleModal from "../../components/shared/SimpleModal/SimpleModal";
import CreateAssignmentProcess from "./FirstStep/CreateAssignmentProcess";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import UploadFilesAP from "./SecondStep/UploadFilesAP";
import InactivesManagementAP from "./ThirdStep/InactivesManagementAP";
import LevelsManagementAP from "./FourthStep/LevelsManagementAP";
import AssignmentManagementAP from "./FifthStep/AssignmentManagementAP";
import TooltipInfo from "../../components/shared/TooltipInfo/TooltipInfo";
import { useAssignmentProcessStore } from "../../store/Assignment";

type ProcessData = {
  year: number;
  semester: 1 | 2;
};

const AssignmentModule: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [hasActiveProcess, setHasActiveProcess] = useState<boolean>(false);
  const [currentStepLocal, setCurrentStepLocal] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  // ----- helpers para persistir paso actual en localStorage -----
  const storageKeyForProcess = (codigo: number) =>
    `assignment_process_${codigo}_current_step`;

  const loadPersistedState = (codigo: number) => {
    try {
      const raw = localStorage.getItem(storageKeyForProcess(codigo));
      return raw
        ? (JSON.parse(raw) as {
            currentStepLocal?: number;
            completedSteps?: number[];
          })
        : null;
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
    } catch {}
  };

  const {
    finalizarProceso,
    eliminarProcesoCompleto,
    obtenerProcesoActivo,
    obtenerTodosLosProcesos,
    notificarEstudiantesPeriodo,   
    currentProcess,
    allProcess,
  } = useAssignmentProcessStore();

  const handleProcessCreated = (year: number, semester: 1 | 2) => {
    setShowCreateModal(false);
    setCurrentStepLocal(1);
    setCompletedSteps([]);
    setProcessData({ year, semester });
  };

  const handleCancelProcess = () => {
    setHasActiveProcess(false);
    setCurrentStepLocal(null);
    setCompletedSteps([]);
    setProcessData(null);
    setShowFinalizeConfirm(false);
    setShowConfirmDelete(false);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    if (!currentProcess) return;

    try {
      await eliminarProcesoCompleto(currentProcess.pa_codigo);
      await obtenerTodosLosProcesos();

      try {
        localStorage.removeItem(storageKeyForProcess(currentProcess.pa_codigo));
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            key.includes(`assignment_process_${currentProcess.pa_codigo}`)
          ) {
            localStorage.removeItem(key);
          }
        }
      } catch {}

      handleCancelProcess();
    } catch (error) {
      console.error("Error eliminando proceso:", error);
      throw error;
    }
  };

  const handleDeleteProcess = () => {
    if (currentProcess) {
      setShowConfirmDelete(true);
    }
  };

  const handleNextStep = () => {
    if (currentStepLocal) {
      const nextStep = currentStepLocal + 1;
      setCompletedSteps((prev) => [...new Set([...prev, currentStepLocal])]);
      setCurrentStepLocal(nextStep);

      if (currentProcess?.pa_codigo) {
        savePersistedState(currentProcess.pa_codigo, nextStep, [
          ...new Set([...completedSteps, currentStepLocal]),
        ]);
      }
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber === currentStepLocal) {
      console.log(`Navegando al paso actual: ${stepNumber}`);
    }
  };

  const getStepBorderClass = (stepNumber: number) => {
    return completedSteps.includes(stepNumber) ? "green" : "red";
  };

  // 🔥 Finalizar proceso + mandar correos
  const handleFinalizeProcess = async () => {
    if (!currentProcess) return;

    try {
      // 1) Finalizar proceso en backend
      const procesoFinalizado = await finalizarProceso(currentProcess.pa_codigo);
      await obtenerTodosLosProcesos();

      // 2) Obtener periodo (prefiere datos del backend)
      const anio =
        (procesoFinalizado && procesoFinalizado.pa_anio) ||
        processData?.year;
      const semestre =
        (procesoFinalizado && procesoFinalizado.pa_num_semestre) ||
        processData?.semester;

      if (anio && semestre) {
        console.log(
          "[AssignmentModule] Enviando notificaciones para periodo",
          `${anio}-${semestre}`
        );
        try {
          const notifResp = await notificarEstudiantesPeriodo(anio, semestre);
          console.log(
            "[AssignmentModule] Resultado notificarEstudiantesPeriodo:",
            notifResp
          );
        } catch (err) {
          console.error(
            "[AssignmentModule] Error enviando notificaciones:",
            err
          );
        }
      } else {
        console.warn(
          "[AssignmentModule] No se pudo obtener anio/semestre para notificar estudiantes."
        );
      }

      setShowFinalizeConfirm(false);
      handleCancelProcess();
    } catch (error) {
      console.error("Error finalizando proceso:", error);
    }
  };

  const handleSeeReport = () => {
    if (processData) {
      navigate(`/reports-assignment`, {
        state: {
          isPreview: true,
          year: processData.year,
          semester: processData.semester,
          processId: currentProcess?.pa_codigo,
        },
      });
    }
  };

  const getProcessStatus = () => {
    const statusMap = {
      1: "Creado",
      2: "Archivos Cargados",
      3: "Archivo Guardado",
      4: "Nivelados Gestionados",
      5: "Asignaciones Completadas",
    };
    return statusMap[currentStepLocal as keyof typeof statusMap] || "Creado";
  };

  useEffect(() => {
    const cargarProcesos = async () => {
      try {
        await obtenerProcesoActivo();
        await obtenerTodosLosProcesos();
      } catch (error) {
        console.error("Error al obtener procesos:", error);
      }
    };
    cargarProcesos();
  }, [obtenerProcesoActivo, obtenerTodosLosProcesos]);

  useEffect(() => {
    if (currentProcess) {
      setHasActiveProcess(true);
      const persisted = loadPersistedState(currentProcess.pa_codigo);

      if (persisted?.currentStepLocal) {
        setCurrentStepLocal(persisted.currentStepLocal);
        setCompletedSteps(persisted.completedSteps ?? []);
      } else {
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
                    <p>La asignación se ha realizado correctamente.</p>
                    <div className="final-buttons">
                      <p style={{ color: "#666", marginBottom: "20px" }}>
                        Puedes revisar los resultados antes de marcar el proceso
                        como finalizado.
                        <br />
                      </p>
                      <div className="final-buttons">
                        <Button
                          variant="primary"
                          className="view-assignment-btn"
                          onClick={handleSeeReport}
                        >
                          Ver asignación
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => setShowFinalizeConfirm(true)}
                        >
                          Finalizar Proceso
                        </Button>
                      </div>
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
                  <span className="status">En Proceso</span>
                </div>
              </div>
            )}

            {/* Procesos finalizados */}
            {allProcess &&
              allProcess
                .filter((proceso) => {
                  const esProcesoActual =
                    currentProcess &&
                    proceso.pa_codigo === currentProcess.pa_codigo;

                  return proceso.pa_estado === 2 && !esProcesoActual;
                })
                .sort((a, b) => {
                  if (a.pa_anio !== b.pa_anio) {
                    return b.pa_anio - a.pa_anio;
                  }
                  return b.pa_num_semestre - a.pa_num_semestre;
                })
                .map((proceso) => {
                  const fechaFinalizacion = new Date(
                    proceso.pa_ultima_fecha_actualizacion
                  ).toLocaleDateString("es-ES");

                  return (
                    <div
                      key={proceso.pa_codigo}
                      className="process-history-item"
                    >
                      <div className="process-period">
                        {proceso.pa_anio}-{proceso.pa_num_semestre}
                      </div>
                      <div className="process-details">
                        <div className="process-date">
                          Finalizado: {fechaFinalizacion}
                        </div>
                        <span className="status-finished">Finalizado</span>
                      </div>
                    </div>
                  );
                })}
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

      <ConfirmModal
        open={showFinalizeConfirm}
        message="¿Está seguro de finalizar el proceso de asignación? Esta acción no se puede deshacer."
        onConfirm={handleFinalizeProcess}
        onCancel={() => setShowFinalizeConfirm(false)}
      />

      <ConfirmModal
        open={showConfirmDelete}
        message="¿Está seguro de eliminar el proceso de asignación activo? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
};

export default AssignmentModule;
