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
import type { ValidationResult } from "../../../../models/Assignment/assignmentProcess";

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
  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryResult, setSummaryResult] = useState<ValidationResult | null>(null);

  // Conectar con los stores
  const { validarExcel, loading, error, clearError } = useExcelProcessingStore();
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
      console.log("Resultado del backend:", resultado);

      // Verificar si hay advertencias
      if (resultado.advertencias && resultado.advertencias.length > 0) {
        console.warn("Advertencias del backend:", resultado.advertencias);
        const mensajeAdvertencias = resultado.advertencias.join("\n\n");
        setWarningMessage(mensajeAdvertencias);
        setShowWarningModal(true);
        return;
      }

      // +++ MODIFICACIÓN: Primero cerrar el modal de archivos, luego mostrar resumen +++
      setShowModal(false);
      
      // Pequeño delay para asegurar que el modal anterior se cierre completamente
      setTimeout(() => {
        setSummaryResult(resultado);
        setShowSummaryModal(true);
        console.log("Modal de resumen abierto:", true);
      }, 100);

    } catch (error: any) {
      console.error("Error validando archivos:", error);
      alert(`Error en validación: ${error.message}`);
    }
  };

  const handleConfirmSave = () => {
    console.log("Confirmando guardado, llamando onNext");
    setShowConfirm(false);
    setShowModal(false);
    setShowSummaryModal(false);
    addCompletedStep(1);
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

  // Función para manejar la continuacion desde el modal de resumen
  const handleContinueFromSummary = () => {
    console.log("Continuando desde resumen");
    setShowSummaryModal(false);
    addCompletedStep(1);
    onNext();
  };

  // +++ NUEVA FUNCIÓN: Para debuguear el estado del modal +++
  React.useEffect(() => {
    console.log("Estado de showSummaryModal:", showSummaryModal);
    console.log("Estado de summaryResult:", summaryResult);
  }, [showSummaryModal, summaryResult]);

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

      {/* Modal de resumen de validación - CORREGIDO */}
      <SimpleModal
        open={showSummaryModal}
        title="Resumen de validación"
        onClose={() => {
          console.log("Cerrando modal de resumen");
          setShowSummaryModal(false);
        }}
      >
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {/* +++ AGREGADO: Debug info +++ */}
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            Debug: showSummaryModal={showSummaryModal.toString()}, 
            faltantes={summaryResult?.faltantes?.length ?? 0}, 
            sobrantes={summaryResult?.sobrantes?.length ?? 0}
          </div>

          <p>
            <strong>Estudiantes faltantes:</strong> {summaryResult?.faltantes?.length ?? 0}
          </p>
          {summaryResult?.faltantes && summaryResult.faltantes.length > 0 && (
            <ul>
              {summaryResult.faltantes.map((f, i) => (
                <li key={`faltante-${i}`}>{f}</li>
              ))}
            </ul>
          )}

          <p>
            <strong>Estudiantes sobrantes:</strong> {summaryResult?.sobrantes?.length ?? 0}
          </p>
          {summaryResult?.sobrantes && summaryResult.sobrantes.length > 0 && (
            <ul>
              {summaryResult.sobrantes.map((s, i) => (
                <li key={`sobrante-${i}`}>{s}</li>
              ))}
            </ul>
          )}

          {/* Lógica corregida para permitir continuar o no */}
          {summaryResult && 
           summaryResult.faltantes && summaryResult.faltantes.length === 0 && 
           summaryResult.sobrantes && summaryResult.sobrantes.length === 0 ? (
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button
                variant="primary"
                onClick={handleContinueFromSummary}
              >
                Continuar
              </Button>
            </div>
          ) : (
            <div style={{ marginTop: 12, color: "#a00" }}>
              <p>
                No es posible continuar: existen filas faltantes o sobrantes. Corrige los archivos y vuelve a validar.
              </p>
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    console.log("Cerrando modal desde botón Cerrar");
                    setShowSummaryModal(false);
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </SimpleModal>
    </div>
  );
};

export default UploadFilesAP;