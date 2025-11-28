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
import BackButton from "../../../../components/ui/BackButton/BackButton";
import NextButton from "../../../../components/ui/NextButton/NextButton";
import SimpleModal from "../../../../components/shared/SimpleModal/SimpleModal";
import MultipleFileUploader from "../../../../components/fileUploader/MultipleFileUploader";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {
  useExcelProcessingStore,
  useAssignmentFlowStore,
} from "../../../../store/Assignment";
import { useCodeBatchStore, useAssignmentProcessStore } from "../../../../store/Assignment/assignmentProcessStore";
import type { ValidationResult } from "../../../../models/Assignment/assignmentProcess";
import type { CodeBatchesResponse } from "../../../../models/Assignment/assignmentProcess";

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
  const [warningMessage] = useState("");

  // Archivos subidos
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Estado para el modal de análisis de formato
  const [showFormatAnalysis, setShowFormatAnalysis] = useState(false);
  const [formatResult, setFormatResult] = useState<{
    cumple: boolean;
    mensajes: string[];
    resultado?: ValidationResult;
  } | null>(null);

  // Estado para el modal de resumen de validación
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryResult, setSummaryResult] = useState<ValidationResult | null>(
    null
  );

  // Estado para manejar generacion y descarga de lotes de códigos
  const [isDownloadingCodes, setIsDownloadingCodes] = useState(false);
  const [codeBatches, setCodeBatches] = useState<string[][]>([]);
  const [codeBatchesModal, setCodeBatchesModal] = useState(false);

  // Stores
  const { validarExcel, loading, error, clearError } =
    useExcelProcessingStore();
  const { addCompletedStep } = useAssignmentFlowStore();
  const { fetchCodeBatches, downloadCodeBatchesPDF } = useCodeBatchStore();
  const { currentProcess } = useAssignmentProcessStore();

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

      // PRIMERO: Mostrar análisis de formato
      setFormatResult({
        cumple: !resultado.advertencias || resultado.advertencias.length === 0,
        mensajes: resultado.advertencias || [],
        resultado: resultado,
      });
      setShowModal(false);
      setShowFormatAnalysis(true);
    } catch (error: any) {
      console.error("Error validando archivos:", error);
      alert(`Error en validación: ${error.message}`);
    }
  };

  const handleConfirmSave = () => {
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

  // Función para manejar la continuación desde el modal de resumen
  const handleContinueFromSummary = () => {
    console.log("Continuando desde resumen");
    setShowSummaryModal(false);
    addCompletedStep(1);
    onNext();
  };


  // Función para generar lotes de códigos
  const handleGenerateCodeBatches = async () => {
    console.log("Generando lotes de códigos...");
    setIsDownloadingCodes(true);

    try {
      const year = currentProcess ? currentProcess.pa_anio : new Date().getFullYear();
      const semester = currentProcess ? currentProcess.pa_num_semestre : 1;
      const data: CodeBatchesResponse = await fetchCodeBatches(year, semester);
      console.log("Lotes de códigos recibidos:", data.lotes);
      const batches = (data.lotes || []).map((batch) =>
        batch.map((code) => code.toString())
      );
      setCodeBatches(batches);
      setCodeBatchesModal(true);
    } catch (error) {
      console.error("Error generando lotes de códigos:", error);
      setShowWarningModal(true);
    } finally {
      setIsDownloadingCodes(false);
    }
  };

  const openCodeBatchesModal = () => {
    if (!codeBatches || codeBatches.length === 0) {
      void handleGenerateCodeBatches();
    } else {
      setCodeBatchesModal(true);
    }
  };

  const handleCopyAllCodes = () => {
    if (!codeBatches || codeBatches.length === 0) {
      console.log("No hay códigos para copiar.");
      return;
    }

    const allCodes = codeBatches.flat().join("\n");
    navigator.clipboard
      .writeText(allCodes)
      .then(() => {
        console.log("Códigos copiados al portapapeles.");
      })
      .catch((err) => {
        console.error("Error al copiar los códigos: ", err);
      });
  };

  // Función para descargar los códigos como un txt
  const handleDownloadCodesTXT = () => {
    if (!codeBatches || codeBatches.length === 0) {
      console.log("No hay códigos para descargar.");
      return;
    } else {
      try {
        const element = document.createElement("a");
        const fileContent = codeBatches
          .map((batch, index) => `Lote ${index + 1}:\n${batch.join(", ")}`)
          .join("\n\n");
        const fileBlob = new Blob([fileContent], { type: "text/plain" });
        element.href = URL.createObjectURL(fileBlob);
        element.download = `lotes_codigos_${currentProcess ? currentProcess.pa_anio : new Date().getFullYear()}_${currentProcess ? currentProcess.pa_num_semestre : 1}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } catch (error) {
        console.error("Error descargando los códigos: ", error);
      }
    }
  };

  // Función para descargar los códigos como un pdf
  const handleDownloadCodesPDF = async () => {
    if (!codeBatches || codeBatches.length === 0) {
      console.log("No hay códigos para descargar.");
      return;
    }
    else {
      try {
        const year = currentProcess ? currentProcess.pa_anio : new Date().getFullYear();
        const semester = currentProcess ? currentProcess.pa_num_semestre : 1;
        const pdfBlob: Blob = await downloadCodeBatchesPDF(year, semester);

        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `lotes_codigos_${year}_${semester}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error("Error descargando los códigos: ", error);
    }
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

      <div className="codes-info">
        <Button
          variant="primary"
          onClick={openCodeBatchesModal}
          disabled={isDownloadingCodes}
        >
          {isDownloadingCodes
            ? "Generando códigos..."
            : "Generar lotes de códigos"}
        </Button>
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

      {/* Modal de Análisis de Formato - NUEVO */}
      <SimpleModal
        open={showFormatAnalysis}
        title="Análisis de Formato"
        onClose={() => setShowFormatAnalysis(false)}
      >
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {formatResult?.cumple ? (
            <div>
              <p>
                <strong>Formato Correcto</strong>
              </p>
              <p>
                Los archivos han pasado la validación de formato exitosamente.
              </p>
            </div>
          ) : (
            <div>
              <p>
                <strong>Problemas de Formato Detectados</strong>
              </p>
              <p>
                Se encontraron los siguientes problemas que deben corregirse:
              </p>
              <ul>
                {formatResult?.mensajes.map((msg, i) => (
                  <li key={i} style={{ color: "#dc3545", marginBottom: "8px" }}>
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <div style={{ width: "120px" }}>
              <BackButton
                onClick={() => {
                  setShowFormatAnalysis(false);
                  setShowModal(true);
                }}
                text="Volver"
              />
            </div>
            <div style={{ width: "120px" }}>
              <NextButton
                onClick={() => {
                  setShowFormatAnalysis(false);
                  if (formatResult?.cumple && formatResult.resultado) {
                    setSummaryResult(formatResult.resultado);
                    setShowSummaryModal(true);
                  }
                }}
                text="Siguiente"
                disabled={!formatResult?.cumple}
              />
            </div>
          </div>
        </div>
      </SimpleModal>

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

      {/* Modal de resumen de validación */}
      <SimpleModal
        open={showSummaryModal}
        title="Resumen de validación"
        onClose={() => {
          setShowSummaryModal(false);
        }}
      >
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          <p>
            <strong>Estudiantes faltantes:</strong>{" "}
            {summaryResult?.faltantes?.length ?? 0}
          </p>
          {summaryResult?.faltantes && summaryResult.faltantes.length > 0 && (
            <ul>
              {summaryResult.faltantes.map((codigo, i) => (
                <li key={`faltante-${i}`}>Código: {codigo}</li>
              ))}
            </ul>
          )}

          <p>
            <strong>Estudiantes sobrantes:</strong>{" "}
            {summaryResult?.sobrantes?.length ?? 0}
          </p>
          {summaryResult?.sobrantes && summaryResult.sobrantes.length > 0 && (
            <ul>
              {summaryResult.sobrantes.map((codigo, i) => (
                <li key={`sobrante-${i}`}>Código: {codigo}</li>
              ))}
            </ul>
          )}

          {/* Lógica para permitir continuar o no */}
          {summaryResult &&
            summaryResult.faltantes &&
            summaryResult.faltantes.length === 0 &&
            summaryResult.sobrantes &&
            summaryResult.sobrantes.length === 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "16px",
              }}
            >
              <div style={{ width: "120px" }}>
                <BackButton
                  onClick={() => {
                    setShowSummaryModal(false);
                    setShowFormatAnalysis(true);
                  }}
                  text="Volver"
                />
              </div>
              <div style={{ width: "120px" }}>
                <NextButton
                  onClick={handleContinueFromSummary}
                  text="Confirmar"
                />
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12, color: "#a00" }}>
              <p>
                No es posible continuar: existen filas faltantes o sobrantes.
                Corrige los archivos y vuelve a validar.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "16px",
                }}
              >
                <div style={{ width: "120px" }}>
                  <BackButton
                    onClick={() => {
                      setShowSummaryModal(false);
                      setShowFormatAnalysis(true);
                    }}
                    text="Volver"
                  />
                </div>
                <div style={{ width: "120px" }}>
                  <NextButton
                    onClick={() => setShowSummaryModal(false)}
                    text="Cerrar"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </SimpleModal>

      {/* Modal de lotes de códigos */}
      <SimpleModal
        open={codeBatchesModal}
        title="Lotes de Códigos Generados"
        onClose={() => setCodeBatchesModal(false)}
      >
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {isDownloadingCodes ? (
            <p>Generando códigos, por favor espere...</p>
          ) : (
            <>
              {codeBatches.map((batch, batchIndex) => (
                <div
                  key={batchIndex}
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>
                    Lote {batchIndex + 1}:
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "monospace",
                      color: "#333",
                    }}
                  >
                    {batch.join(", ")}
                  </p>
                </div>
              ))}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Button variant="primary" onClick={handleCopyAllCodes}>
                  Copiar
                </Button>

                <Button variant="primary" onClick={handleDownloadCodesTXT}>
                  Descargar txt
                </Button>

                <Button variant="primary" onClick={handleDownloadCodesPDF}>
                  Descargar pdf
                </Button>

              </div>
            </>
          )}
        </div>
      </SimpleModal>
    </div>
  );
};

export default UploadFilesAP;
