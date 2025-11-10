import React, { useState } from "react";
import "../AssignmentProcessSteps.css";
import {
  FaUserSlash,
  FaUserCheck,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import WarningModal from "../../../../components/shared/WarningModal/WarningModal";
import Button from "../../../../components/ui/Button/Button";
import SimpleModal from "../../../../components/shared/SimpleModal/SimpleModal";
import MultipleFileUploader from "../../../../components/fileUploader/MultipleFileUploader";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {
  useExcelProcessingStore,
  useAssignmentFlowStore,
} from "../../../../store/Assignment";

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
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Conectar con los stores
  const { validarExcel, loading, error, clearError } =
    useExcelProcessingStore();
  const { addCompletedStep } = useAssignmentFlowStore();

  // Manejar archivos subidos desde MultipleFileUploader
  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files);
    clearError();
  };

  const handleSave = async () => {
    if (uploadedFiles.length === 0) {
      alert("Por favor, sube al menos un archivo Excel");
      return;
    }

    try {
      console.log("Validando formato de archivos Excel...", uploadedFiles);

      const resultado = await validarExcel(uploadedFiles);
      console.log("Resultado del backend:", resultado); // Para depuración

      // Verificar si hay advertencias
      if (resultado.advertencias && resultado.advertencias.length > 0) {
        console.warn("Advertencias del backend:", resultado.advertencias);

        const mensajeAdvertencias = resultado.advertencias.join("\n\n");
        setWarningMessage(mensajeAdvertencias);
        setShowWarningModal(true);
        return; // No seguir si hay advertencias
      }

      setShowConfirm(true);
    } catch (error: any) {
      console.error("Error validando archivos:", error);
      alert(`Error en validación: ${error.message}`);
    }
  };

  const handleConfirmSave = () => {
    console.log("Confirmando guardado, llamando onNext");
    setShowConfirm(false);
    setShowModal(false);
    addCompletedStep(1); // Marcar paso 1 como completado
    onNext();
  };

  const handleCardClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      setShowModal(true);
      clearError();
    } else {
      onStepClick(stepNumber);
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

      {/* MODAL para el Paso 1 - Cargar archivos */}
      {currentStep === 1 && (
        <SimpleModal
          open={showModal}
          title="Seleccionador de archivos Excel"
          onClose={() => {
            setShowModal(false);
            clearError();
          }}
        >
          <div className="fileUploader">
            <MultipleFileUploader onFilesUploaded={handleFilesUploaded} />
          </div>

          {/* Mostrar estado de carga y error */}
          {loading && (
            <div style={{ textAlign: "center", padding: "10px" }}>
              <p>Validando archivos Excel...</p>
            </div>
          )}

          {error && (
            <div
              style={{
                color: "red",
                margin: "10px 0",
                padding: "10px",
                backgroundColor: "#ffe6e6",
                borderRadius: "4px",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="aps-step-buttons" style={{ marginTop: "16px" }}>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || uploadedFiles.length === 0}
            >
              {loading ? "Validando..." : "Continuar"}
            </Button>
          </div>
        </SimpleModal>
      )}

      {/* Modal de advertencia para errores de formato */}
      <WarningModal
        open={showWarningModal}
        message={warningMessage}
        onClose={() => setShowWarningModal(false)}
      />

      {/* Modal de confirmación para continuar */}
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
