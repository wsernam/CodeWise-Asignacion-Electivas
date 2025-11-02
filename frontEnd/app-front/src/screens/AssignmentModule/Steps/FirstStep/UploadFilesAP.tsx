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
import MultipleFileUploader from "../../../../components/fileUploader/MultipleFileUploader";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";

type AssignmentProcessProps = {
  onNext: () => void;
  onCancel: () => void;
  onStepClick: (stepNumber: number) => void;
  currentStep: number;
  completedSteps: number[];
  getStepBorderClass: (stepNumber: number) => string;
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

const UploadFilesAP: React.FC<AssignmentProcessProps> = ({
  onNext,
  onStepClick,
  currentStep,
  getStepBorderClass,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Manejar clic en los cuadritos
  const handleCardClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      // Si es el paso actual, abrir el modal
      setShowModal(true);
    } else {
      // Si es otro paso, navegar a ese paso
      onStepClick(stepNumber);
    }
  };

  const handleSave = () => setShowConfirm(true);
  const handleConfirmSave = () => {
    console.log("Confirmando guardado, llamando onNext");
    setShowConfirm(false);
    setShowModal(false);
    onNext();
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

      {/* MODAL para el Paso 1 - Cargar archivos */}
      {currentStep === 1 && (
        <SimpleModal
          open={showModal}
          title="Seleccionador de archivos Excel"
          onClose={() => setShowModal(false)}
        >
          <div className="fileUploader">
            <MultipleFileUploader />
          </div>
          <div className="aps-step-buttons">
            <Button variant="primary" onClick={handleSave}>
              Continuar
            </Button>
          </div>
        </SimpleModal>
      )}

      <ConfirmModal
        open={showConfirm}
        message="¿Está seguro de guardar este paso y continuar?"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default UploadFilesAP;
