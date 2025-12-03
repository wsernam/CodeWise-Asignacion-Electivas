import React from "react";
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
import { useAssignmentProcessStore } from "../../../../store/Assignment";

type AssignmentProcessProps = {
  onNext: () => void;
  onCancel: () => void;
  onStepClick: (stepNumber: number) => void;
  currentStep: number;
  completedSteps: number[];
  getStepBorderClass: (stepNumber: number) => string;
  // No necesitamos processData aquí, solo en AssignmentModule
};

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

const AssignmentManagementAP: React.FC<AssignmentProcessProps> = ({
  onNext,
  onStepClick,
  currentStep,
  getStepBorderClass,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Acciones del store
  const ejecutarAsignacion = useAssignmentProcessStore(
    (s: any) => s.ejecutarAsignacion
  );
  const loading = useAssignmentProcessStore((s) => s.loading);

  const handleCardClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      setShowModal(true);
    } else {
      onStepClick(stepNumber);
    }
  };

  // FUNCIÓN: Solo ejecutar asignación y avanzar al paso 5
  const handleExecuteAssignment = async () => {
    try {
      await ejecutarAsignacion(); // Solo ejecuta la asignación
      setShowModal(false);
      onNext(); // ✅ Avanza al paso 5 (para ver asignación y finalizar proceso)
    } catch (e: any) {
      console.error("Error ejecutando la asignación:", e?.message || e);
    }
  };

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

      {currentStep === 4 && (
        <>
          <SimpleModal
            open={showModal}
            title="Asignación de electivas"
            onClose={() => setShowModal(false)}
          >
            <div className="assignment-content">
              <p>Proceso de asignación automática de electivas...</p>
              <p>
                Se asignarán las electivas según los criterios establecidos.
              </p>

              <div className="aps-step-buttons">
                <Button
                  variant="primary"
                  onClick={handleExecuteAssignment}
                  disabled={loading}
                >
                  {loading
                    ? "Ejecutando asignación..."
                    : "Finalizar asignación"}
                </Button>
              </div>
            </div>
          </SimpleModal>
        </>
      )}
    </div>
  );
};

export default AssignmentManagementAP;
