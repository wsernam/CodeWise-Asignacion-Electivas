import React, { useState, useEffect } from "react";
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
import { useExcelProcessingStore } from "../../../../store/Assignment";
import InactivesTable, { type InactiveRow } from "./InactivesTable";

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

const InactivesManagementAP: React.FC<AssignmentProcessProps> = ({
  onNext,
  onStepClick,
  currentStep,
  getStepBorderClass,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inactiveRows, setInactiveRows] = useState<InactiveRow[]>([]);
  const [nextId, setNextId] = useState(1);

  // Conectar con store de Excel
  const {
    incompleteRows,
    previsualizarIncompletos,
    completarYProcesar,
    uploadedFiles,
    loading,
    error,
    clearError,
  } = useExcelProcessingStore();

  // Efecto para cargar filas incompletas automáticamente
  useEffect(() => {
    if (showModal && uploadedFiles.length > 0) {
      const cargarIncompletos = async () => {
        try {
          await previsualizarIncompletos(uploadedFiles);
        } catch (error) {
          console.error("Error cargando estudiantes incompletos:", error);
        }
      };

      cargarIncompletos();
    }
  }, [showModal, uploadedFiles, previsualizarIncompletos]);

  // Convertir incompleteRows del servicio a inactiveRows del componente
  useEffect(() => {
    if (incompleteRows.length > 0) {
      const convertedRows: InactiveRow[] = incompleteRows.map((row, index) => ({
        id: index + 1,
        codigo: row.codigo?.toString() || "",
        nombre: "",
        apellido: "",
        programa: "",
        creditosObligatorios: "",
        periodosMatriculados: "",
        porcentajeAvance: "",
      }));
      setInactiveRows(convertedRows);
      setNextId(convertedRows.length + 1);
    }
  }, [incompleteRows]);

  // Función para verificar si hay estudiantes inactivos
  const hayEstudiantesInactivos = () => {
    return inactiveRows.some((row) => {
      const camposObligatoriosLlenos =
        row.codigo && row.nombre && row.apellido && row.programa;

      const validarSoloLetras = (valor: string): boolean => {
        if (!valor) return false;
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor);
      };

      const validarPorcentaje = (valor: string): boolean => {
        if (!valor) return false;
        const num = Number(valor);
        return !isNaN(num) && num >= 0 && num <= 100;
      };

      const validarNumeroPositivo = (valor: string): boolean => {
        if (!valor) return false;
        const num = Number(valor);
        return !isNaN(num) && num >= 0;
      };

      const nombreValido = validarSoloLetras(row.nombre);
      const apellidoValido = validarSoloLetras(row.apellido);
      const creditosValidos = validarNumeroPositivo(row.creditosObligatorios);
      const periodosValidos = validarNumeroPositivo(row.periodosMatriculados);
      const porcentajeValido = validarPorcentaje(row.porcentajeAvance);

      return !(
        camposObligatoriosLlenos &&
        nombreValido &&
        apellidoValido &&
        creditosValidos &&
        periodosValidos &&
        porcentajeValido
      );
    });
  };

  const handleCardClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      setShowModal(true);
      clearError();
    } else {
      onStepClick(stepNumber);
    }
  };

  // Envía los datos al backend
  const handleSave = async () => {
    try {
      // Preparar datos para enviar al backend
      const filasACompletar = inactiveRows
        .filter((row) => row.codigo)
        .map((row) => ({
          archivo: "archivo_procesado",
          fila: row.id,
          datos: {
            codigo_estudiante: row.codigo,
            nombre: row.nombre,
            apellido: row.apellido,
            programa: row.programa,
            creditos_obligatorios: parseInt(row.creditosObligatorios) || 0,
            periodos_matriculados: parseInt(row.periodosMatriculados) || 0,
            porcentaje_avance: parseFloat(row.porcentajeAvance) || 0,
          },
        }));

      console.log("Enviando datos al backend:", filasACompletar);

      // Enviar al backend para procesamiento final
      await completarYProcesar(filasACompletar);

      setShowConfirm(true);
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert("Error al guardar los cambios. Intenta nuevamente.");
    }
  };

  const handleConfirmSave = () => {
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

      {currentStep === 2 && (
        <SimpleModal
          open={showModal}
          title="Gestión de potenciales inactivos"
          onClose={() => setShowModal(false)}
        >
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {inactiveRows.length === 0 ? (
              <div className="inactives-empty">
                <p>No se han identificado posibles estudiantes inactivos</p>
                {loading && <p>Cargando estudiantes incompletos...</p>}
                {error && (
                  <div style={{ color: "red", margin: "10px 0" }}>
                    Error: {error}
                  </div>
                )}
              </div>
            ) : (
              <>
                <InactivesTable
                  rows={inactiveRows}
                  onRowsChange={setInactiveRows}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading || hayEstudiantesInactivos()}
                  >
                    {loading ? "Guardando..." : "Continuar"}
                  </Button>
                </div>
              </>
            )}
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

export default InactivesManagementAP;
