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
import TooltipInfo from "../../../../components/ui/TooltipInfo/TooltipInfo";
import {
  useExcelProcessingStore,
  useAssignmentFlowStore,
} from "../../../../store/Assignment";
import {
  useCodeBatchStore,
  useAssignmentProcessStore,
} from "../../../../store/Assignment/assignmentProcessStore";
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

      // Verificar formato
      const formatoCumple =
        !resultado.advertencias || resultado.advertencias.length === 0;

      // Verificar datos
      const datosCumplen =
        (!resultado.faltantes || resultado.faltantes.length === 0) &&
        (!resultado.sobrantes || resultado.sobrantes.length === 0);

      if (formatoCumple && datosCumplen) {
        // Continuar automáticamente si todo ok
        console.log("Todo correcto, continuando...");
        addCompletedStep(1);
        onNext();
      } else if (!formatoCumple) {
        setFormatResult({
          cumple: formatoCumple,
          mensajes: resultado.advertencias || [],
          resultado: resultado,
        });
        setShowModal(false);
        setShowFormatAnalysis(true);
      } else if (!datosCumplen) {
        setSummaryResult(resultado);
        setShowModal(false);
        setShowSummaryModal(true);
      }
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
      const year = currentProcess
        ? currentProcess.pa_anio
        : new Date().getFullYear();
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
        element.download = `lotes_codigos_${
          currentProcess ? currentProcess.pa_anio : new Date().getFullYear()
        }_${currentProcess ? currentProcess.pa_num_semestre : 1}.txt`;
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
    } else {
      try {
        const year = currentProcess
          ? currentProcess.pa_anio
          : new Date().getFullYear();
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
            {/* ELIMINA el botón de seleccionar del MultipleFileUploader */}
            {/* Solo muestra la lista de archivos */}
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {uploadedFiles.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  No hay archivos seleccionados
                </div>
              ) : (
                uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "8px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{file.name}</span>
                    <button
                      onClick={() => {
                        const newFiles = [...uploadedFiles];
                        newFiles.splice(index, 1);
                        setUploadedFiles(newFiles);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "red",
                        cursor: "pointer",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                ))
              )}
            </div>
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

          {/* BOTONES ABAJO */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              {/* Botón Seleccionar archivos */}
              <input
                id="modal-file-input"
                type="file"
                multiple
                accept=".xlsx,.xls,.xlsm,.xltm,.xltx,.csv"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setUploadedFiles([...uploadedFiles, ...newFiles]);
                  }
                }}
                style={{ display: "none" }}
              />
              <Button
                variant="primary"
                size="medium"
                onClick={() =>
                  document.getElementById("modal-file-input")?.click()
                }
              >
                Seleccionar archivos
              </Button>

              {/* Botón Limpiar todo */}
              {uploadedFiles.length > 0 && (
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => setUploadedFiles([])}
                >
                  Limpiar todo
                </Button>
              )}
            </div>

            {/* Botón Continuar */}
            <div>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={loading || uploadedFiles.length === 0}
              >
                {loading ? "Validando..." : "Continuar"}
              </Button>
            </div>
          </div>
        </SimpleModal>
      )}

      {/* Modal de Análisis de Formato */}
      <SimpleModal
        open={showFormatAnalysis}
        titleTooltip={
          <div className="title-with-tooltip">
            Análisis de Formato
            <TooltipInfo
              symbol="?"
              title="Requisitos del Formato Excel"
              description={
                <>
                  <strong>El archivo debe tener esta estructura exacta:</strong>
                  <br />• <strong>Columnas en este orden:</strong> CODIGO,
                  CREDITOS_APROBADOS, PROMEDIO_CARRERA, APROBADAS,
                  PERIODOS_MATRICULADOS.
                  <br />• <strong>Encabezados exactos</strong> (sin espacios
                  extra o caracteres especiales).
                  <br />• <strong>Datos numéricos</strong> en las columnas
                  correspondientes.
                  <br />• <strong>Sin filas vacías</strong> entre los datos.
                  <br />• <strong>Sin formatos complejos</strong> como celdas
                  combinadas.
                  <br />• <strong>Tipos de datos correctos:</strong> números
                  enteros donde corresponda.
                </>
              }
              position="bottom"
            />
          </div>
        }
        onClose={() => setShowFormatAnalysis(false)}
      >
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          <div>
            <p>
              <strong>Problemas de Formato Detectados</strong>
            </p>
            <p>Se encontraron los siguientes problemas que deben corregirse:</p>
            <ul>
              {formatResult?.mensajes.map((msg, i) => (
                <li key={i} style={{ color: "#dc3545", marginBottom: "8px" }}>
                  {msg}
                </li>
              ))}
            </ul>
          </div>
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
          </div>
        </div>
      </SimpleModal>

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
        titleTooltip={
          <div className="title-with-tooltip">
            Análisis de Datos
            <TooltipInfo
              symbol="?"
              title="¿Qué significan estos errores?"
              description={
                <>
                  <strong>Estudiantes faltantes: </strong>
                  son estudiantes que sí llenaron el formulario de inscripción
                  pero no aparecen en el archivo Excel. Puede agregarlos al
                  archivo con todos sus datos e intentar nuevamente.
                  <br />
                  <strong>Estudiantes sobrantes: </strong>
                  son estudiantes que no llenaron el formulario de inscripción
                  pero sí aparecen en el archivo Excel. Puede removerlos del
                  archivo e intentar nuevamente.
                  <br />
                </>
              }
              position="right"
            />
          </div>
        }
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
                    setShowModal(true);
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
                No es posible continuar: corrige los archivos y vuelve a
                validar.
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
                      setShowModal(true);
                    }}
                    text="Volver"
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
