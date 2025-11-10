import React, { useState, useEffect } from "react";
import "../AssignmentProcessSteps.css";
import "./InactivesTable.css";
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

type AssignmentProcessProps = {
  onNext: () => void;
  onCancel: () => void;
  onStepClick: (stepNumber: number) => void;
  currentStep: number;
  completedSteps: number[];
  getStepBorderClass: (stepNumber: number) => string;
};

type InactiveRow = {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  programa: string;
  creditosObligatorios: string;
  periodosMatriculados: string;
  porcentajeAvance: string;
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

// COMPONENTE DE TABLA SEPARADO - CORREGIDO
const InactivesTable: React.FC<{
  rows: InactiveRow[];
  onRowsChange: (rows: InactiveRow[]) => void;
}> = ({ rows, onRowsChange }) => {
  const handleInputChange = (
    rowId: number,
    field: keyof InactiveRow,
    value: string
  ) => {
    const updatedRows = rows.map((row) =>
      row.id === rowId ? { ...row, [field]: value } : row
    );
    onRowsChange(updatedRows);
  };

  const isActive = (row: InactiveRow) => {
    // Validar que todos los campos obligatorios estén llenos
    const camposObligatoriosLlenos =
      row.codigo && row.nombre && row.apellido && row.programa;

    // Validar que los campos numéricos tengan formato correcto
    const creditosValidos =
      !isNaN(Number(row.creditosObligatorios)) &&
      row.creditosObligatorios !== "";
    const periodosValidos =
      !isNaN(Number(row.periodosMatriculados)) &&
      row.periodosMatriculados !== "";
    const porcentajeValido =
      !isNaN(Number(row.porcentajeAvance)) && row.porcentajeAvance !== "";

    return (
      camposObligatoriosLlenos &&
      creditosValidos &&
      periodosValidos &&
      porcentajeValido
    );
  };

  return (
    <div className="inactives-table-container">
      <table className="inactives-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Programa</th>
            <th>Cr. oblig.</th>
            <th>Periodos</th>
            <th>% avance</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  defaultValue={row.codigo}
                  onBlur={(e) =>
                    handleInputChange(row.id, "codigo", e.target.value)
                  }
                  className="inactives-input"
                  placeholder="Código"
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={row.nombre}
                  onBlur={(e) =>
                    handleInputChange(row.id, "nombre", e.target.value)
                  }
                  className="inactives-input"
                  placeholder="Nombre"
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={row.apellido}
                  onBlur={(e) =>
                    handleInputChange(row.id, "apellido", e.target.value)
                  }
                  className="inactives-input"
                  placeholder="Apellido"
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={row.programa}
                  onBlur={(e) =>
                    handleInputChange(row.id, "programa", e.target.value)
                  }
                  className="inactives-input"
                  placeholder="Programa"
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={row.creditosObligatorios}
                  onBlur={(e) =>
                    handleInputChange(
                      row.id,
                      "creditosObligatorios",
                      e.target.value
                    )
                  }
                  className="inactives-input"
                  placeholder="0"
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={row.periodosMatriculados}
                  onBlur={(e) =>
                    handleInputChange(
                      row.id,
                      "periodosMatriculados",
                      e.target.value
                    )
                  }
                  className="inactives-input"
                  placeholder="0"
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={row.porcentajeAvance}
                  onBlur={(e) =>
                    handleInputChange(
                      row.id,
                      "porcentajeAvance",
                      e.target.value
                    )
                  }
                  className="inactives-input"
                  placeholder="0"
                  step="0.1"
                />
              </td>
              <td>
                <span
                  className={`status ${isActive(row) ? "active" : "inactive"}`}
                >
                  {isActive(row) ? "Activo" : "Inactivo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
// COMPONENTE PRINCIPAL
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
        .filter((row) => row.codigo) // Solo filas con código (no vacías)
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
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar y Continuar"}
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
