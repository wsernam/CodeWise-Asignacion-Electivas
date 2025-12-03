import React, { useEffect, useState } from "react";
import "../AssignmentProcessSteps.css";
import {
  FaUserSlash,
  FaUserCheck,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import Button from "../../../../components/ui/Button/Button";
import SimpleModal from "../../../../components/shared/SimpleModal/SimpleModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";

import { useAssignmentProcessStore, useNiveladosStore } from "../../../../store/Assignment";
import { message } from "antd";

type AssignmentProcessProps = {
  onNext: () => void;
  onCancel: () => void;
  onStepClick: (stepNumber: number) => void;
  currentStep: number;
  completedSteps: number[];
  getStepBorderClass: (stepNumber: number) => string;

  currentProccess?: {
    pa_anio: number;
    pa_num_semester: number;
  };
};

/*
type LeveledStudent = {
  codigo: string;
  nombre: string;
  apellido: string;
  programa: string;
  creditosObligatorios: number;
  periodosMatriculados: number;
  porcentajeAvance: number;
  confirmado: boolean;
};
*/

const cards = [
  {
    id: 1,
    title: "\nCargar archivos\n\n",
    icon: <FaFileAlt className="aps-icon aps-file" />,
    stepNumber: 1,
  },
  {
    id: 2,
    title: "Gestion de potenciales\ninactivos",
    icon: <FaUserSlash className="aps-icon aps-user-slash" />,
    stepNumber: 2,
  },
  {
    id: 3,
    title: "Gestion de potenciales\nnivelados",
    icon: <FaUserCheck className="aps-icon aps-user-check" />,
    stepNumber: 3,
  },
  {
    id: 4,
    title: "\nAsignacion\n\n",
    icon: <FaClipboardList className="aps-icon aps-clipboard" />,
    stepNumber: 4,
  },
];

const LevelsManagementAP: React.FC<AssignmentProcessProps> = ({
  onNext,
  onStepClick,
  currentStep,
  getStepBorderClass,
  currentProccess,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Manejo de estudiantes confirmados
  const [confirmedStudents, setConfirmedStudents] = useState<Set<number>>(new Set());

  // ========= local state =========

  // Estado local para estudiantes nivelados
  const {
    leveledStudents,
    loading,
    error,
    gestionarNivelados,
    listarNivelados,
    confirmarNivelados,
    clearError,
  } = useNiveladosStore();

  // Obtener el proceso activo desde el store o props
  const storeProcess = useAssignmentProcessStore((s: any) => s.currentProcess);
  const activeProcess = currentProccess ?? storeProcess;



  const confirmedCount = confirmedStudents.size;

  // Manejo de errores
  useEffect(() => {
    if (error) {
      console.error("[LevelsManagementAP] Error detectado:", error);
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCardClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      setShowModal(true);
    } else {
      onStepClick(stepNumber);
    }
  };

  const handleSave = async () => {
    console.log("[LevelsManagementAP] handleSave called");
    if (!activeProcess) {
      message.warning("No hay un proceso activo seleccionado");
      return;
    }

    try {
      console.log("[LevelsManagementAP] Confirmando estudiantes nivelados...");
      const estudiantesAConfirmar = leveledStudents.map(student => ({
        est_codigo: student.estudiante.est_codigo,
        nivelado: confirmedStudents.has(student.estudiante.est_codigo) ? 1 : 0
      }));

      console.log("[LevelsManagementAP] Confirmando nivelados:", estudiantesAConfirmar);

      await confirmarNivelados(
        activeProcess.pa_anio,
        activeProcess.pa_num_semestre,
        estudiantesAConfirmar
      );

      message.success(`${confirmedCount} estudiantes confirmados como nivelados`);
      setShowConfirm(true);
    } catch (error) {
      console.error("[LevelsManagementAP] Error confirmando nivelados:", error);
      message.error("Error al confirmar estudiantes nivelados");
    }
  };

  const handleConfirmSave = () => {
    setShowConfirm(false);
    setShowModal(false);
    onNext();
  };

  const loadLeveledStudents = async () => {
    console.log("[LevelsManagementAP] loadLeveledStudents called", {currentProccess, storeProcess, activeProcess});
    if (!activeProcess) {
      message.error("No hay un proceso de asignación activo.");
      return;
    }

    try {
      console.log("[LevelsManagementAP] Cargando estudiantes nivelados...");
      await gestionarNivelados(activeProcess.pa_anio, activeProcess.pa_num_semestre);
      console.log("[LevelsManagementAP] Listando estudiantes nivelados...");
      await listarNivelados(activeProcess.pa_anio, activeProcess.pa_num_semestre);
      console.log("[LevelsManagementAP] Estudiantes nivelados cargados:", leveledStudents);
      setConfirmedStudents(new Set());
      message.success("Estudiantes nivelados cargados correctamente.");
    } catch (err: any) {
      message.error(
        err.message || "Error al cargar los estudiantes nivelados."
      );
    }
  };

  const toggleConfirmation = (codigo: number) => {
    setConfirmedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(codigo)) newSet.delete(codigo);
      else newSet.add(codigo);
      console.debug("[LevelsManagementAP] toggleConfirmation -> newSet size", newSet.size);
      return newSet;
    });
  };

  const isConfirmed = (codigo: number) => confirmedStudents.has(codigo);

  const getStatusText = (codigo: number) => (isConfirmed(codigo) ? "Nivelado" : "Por confirmar");
  const getStatusClass = (codigo: number) => (isConfirmed(codigo) ? "tag--green" : "tag--default");

  return (
    <div className="aps-wrapper">
      <div className="aps-grid">
        {cards.map((card) => {
          const borderClass = getStepBorderClass(card.stepNumber);
          return (
            <div
              key={card.id}
              className={`aps-card-wrap ${borderClass}`}
              onClick={() => handleCardClick(card.stepNumber)}
            >
              <div className="aps-inner">
                <div className="aps-icon-box">{card.icon}</div>
              </div>
              <div className="aps-title">{card.title}</div>
            </div>
          );
        })}
      </div>

      {currentStep === 3 && (
        <SimpleModal
          open={showModal}
          title="Gestión de potenciales nivelados"
          onClose={() => setShowModal(false)}
        >
          <div className="im-modal-content">
            {loading ? (
              <div className="im-empty">
                <p>Cargando estudiantes nivelados...</p>
              </div>
            ) : leveledStudents.length === 0 ? (
              <div className="im-empty">
                <p>No se han identificado potenciales estudiantes nivelados</p>
                <Button variant="primary" onClick={loadLeveledStudents}>
                  Cargar estudiantes nivelados
                </Button>
              </div>
            ) : (
              <>
                <div
                  className="im-status-wrapper"
                  style={{ marginBottom: "16px" }}
                >
                  <small>Estudiantes confirmados: </small>
                  <strong>
                    {confirmedCount} de {leveledStudents.length}
                  </strong>
                </div>

                <table className="im-table">
                  <thead>
                    <tr>
                      <th className="im-th">Código</th>
                      <th className="im-th">Nombre</th>
                      <th className="im-th">Apellido</th>
                      <th className="im-th">Programa</th>
                      <th className="im-th">Cr. oblig.</th>
                      <th className="im-th">Periodos</th>
                      <th className="im-th">% avance</th>
                      <th className="im-th">Estado</th>
                      <th className="im-th">Confirmar</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leveledStudents.map((student) => {
                      const codigo = student.estudiante.est_codigo;
                      return (
                        <tr key={codigo}>
                          <td className="im-cell">{codigo}</td>
                          <td className="im-cell">{student.estudiante.est_nombre}</td>
                          <td className="im-cell">{student.estudiante.est_apellido}</td>
                          <td className="im-cell">{student.estudiante.programa.pro_nombre}</td>
                          <td className="im-cell">{student.creditos_aprob_total}</td>
                          <td className="im-cell">{student.num_periodos_matriculados}</td>
                          <td className="im-cell">{student.porcentaje_avance}%</td>
                          <td className="im-cell">
                            <span className={getStatusClass(codigo)}>
                              {getStatusText(codigo)}
                            </span>
                          </td>
                          <td className="im-cell">
                            <input
                              type="checkbox"
                              checked={isConfirmed(codigo)}
                              onChange={() => toggleConfirmation(codigo)}
                              style={{ transform: "scale(1.2)" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="im-small-actions">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={confirmedCount === 0}
                  >
                    {loading ? "Confirmando..." : `Confirmar nivelados (${confirmedCount})`}

                  </Button>
                </div>
              </>
            )}
          </div>
        </SimpleModal>
      )}

      <ConfirmModal
        open={showConfirm}
        message={`¿Está seguro de confirmar ${confirmedCount} estudiante(s) como nivelados y continuar?`}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default LevelsManagementAP;
