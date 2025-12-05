import React, { useState, useEffect } from "react";
import "../AssignmentProcessSteps.css";
import {
  FaUserSlash,
  FaUserCheck,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import BackButton from "../../../../components/ui/BackButton/BackButton";
import NextButton from "../../../../components/ui/NextButton/NextButton";
import SimpleModal from "../../../../components/shared/SimpleModal/SimpleModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import Button from "../../../../components/ui/Button/Button";
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
  const [confirmMessage, setConfirmMessage] = useState<string>(
    "¿Está seguro de guardar este paso y continuar?"
  );

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
        // Datos que vienen del backend para identificar la fila
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
    // 1. Determinar si hay estudiantes con datos inválidos o incompletos.
    // Si el usuario decide continuar, estos estudiantes no se incluirán en la importación final.
    if (hayEstudiantesInactivos()) {
      setConfirmMessage(
        "Hay estudiantes con datos incompletos o inválidos. Si continúa, solo se procesarán los estudiantes con datos completos. ¿Desea continuar?"
      );
      setShowConfirm(true);
      return; // Muestra el modal y espera la confirmación del usuario.
    }

    // Si todos los datos son válidos o no hay filas, procede directamente.
    await procesarYContinuar();
  };

  // Función que realmente llama al backend y avanza.
  const procesarYContinuar = async () => {
    try {
      // 2. Preparar los datos para enviar al backend.
      // Filtramos solo las filas que el usuario completó y que son válidas.
      const filasACompletar = inactiveRows
        .filter((row) => !hayEstudiantesInactivos()) // Solo las filas completas y válidas
        .map((row) => {
          const originalRow = incompleteRows.find(
            (ir) => ir.codigo.toString() === row.codigo
          );
          return {
            archivo: originalRow?.archivo || "", // Nombre de archivo original
            fila: originalRow?.fila || 0, // Número de fila original
            datos: {
              // Nombres de campo que el backend espera
              CREDITOS_APROBADOS: parseInt(row.creditosObligatorios) || 0,
              PROMEDIO_CARRERA: parseFloat(row.porcentajeAvance) || 0, // Asumiendo que porcentajeAvance es el promedio
              APROBADAS: 0, // Este campo no está en el formulario, se envía 0
              PERIODOS_MATRICULADOS: parseInt(row.periodosMatriculados) || 0,
            },
          };
        });

      // 3. Llamar al endpoint. Si `filasACompletar` está vacío, el backend solo procesará.
      await completarYProcesar(filasACompletar);

      // 4. Si la llamada es exitosa, avanzar al siguiente paso.
      setShowConfirm(false); // Cierra el modal de confirmación si estaba abierto
      setShowModal(false);
      onNext();
    } catch (error) {
      console.error("Error guardando cambios:", error);
    }
  };

  const handleConfirmSave = () => {
    // Esta función ahora solo llama a la lógica de procesamiento.
    procesarYContinuar();
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    Confirmar
                  </Button>
                </div>
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
                    justifyContent: "space-between",
                    marginTop: "16px",
                  }}
                >
                  <div style={{ width: "120px" }}>
                    <BackButton
                      onClick={() => setShowModal(false)}
                      text="Volver"
                    />
                  </div>
                  <div style={{ width: "120px" }}>
                    <NextButton
                      onClick={handleSave}
                      text="Confirmar"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </SimpleModal>
      )}

      <ConfirmModal
        open={showConfirm}
        message={confirmMessage}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default InactivesManagementAP;
