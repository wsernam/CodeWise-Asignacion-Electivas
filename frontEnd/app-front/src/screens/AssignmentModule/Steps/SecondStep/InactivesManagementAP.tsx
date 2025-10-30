import React, { useState } from "react";
import "../AssignmentProcessSteps.css";
import "./InactivesTable.css"; // CSS separado
import { Tag } from "antd";
import {
  FaUserSlash,
  FaUserCheck,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import Button from "../../../../components/ui/Button/Button";
import SimpleModal from "../../../../components/shared/SimpleModal/SimpleModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";

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

// COMPONENTE DE TABLA SEPARADO
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

  const removeRow = (rowId: number) => {
    const updatedRows = rows.filter((row) => row.id !== rowId);
    onRowsChange(updatedRows);
  };

  const isActive = (row: InactiveRow) => {
    return row.codigo && row.nombre && row.apellido && row.programa;
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
            <th>Acción</th>
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
                  type="text"
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
                  type="text"
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
                  type="text"
                  defaultValue={row.porcentajeAvance}
                  onBlur={(e) =>
                    handleInputChange(
                      row.id,
                      "porcentajeAvance",
                      e.target.value
                    )
                  }
                  className="inactives-input"
                  placeholder="0%"
                />
              </td>
              <td>
                {isActive(row) ? (
                  <Tag color="green">Activo</Tag>
                ) : (
                  <Tag color="default">Incompleto</Tag>
                )}
              </td>
              <td>
                <Button variant="secondary" onClick={() => removeRow(row.id)}>
                  Eliminar
                </Button>
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
  onCancel,
  onStepClick,
  currentStep,
  completedSteps,
  getStepBorderClass,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inactiveRows, setInactiveRows] = useState<InactiveRow[]>([]);
  const [nextId, setNextId] = useState(1);

  const handleCardClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      setShowModal(true);
    } else {
      onStepClick(stepNumber);
    }
  };

  const handleSave = () => setShowConfirm(true);
  const handleConfirmSave = () => {
    setShowConfirm(false);
    setShowModal(false);
    onNext();
  };

  const addEmptyRow = () => {
    const newRow: InactiveRow = {
      id: nextId,
      codigo: "",
      nombre: "",
      apellido: "",
      programa: "",
      creditosObligatorios: "",
      periodosMatriculados: "",
      porcentajeAvance: "",
    };
    setInactiveRows((prev) => [...prev, newRow]);
    setNextId((prev) => prev + 1);
  };

  const detectInactives = () => {
    setInactiveRows([
      {
        id: 1,
        codigo: "104622011437",
        nombre: "Lina",
        apellido: "Diaz",
        programa: "Ingeniería de Sistemas",
        creditosObligatorios: "80",
        periodosMatriculados: "8",
        porcentajeAvance: "40%",
      },
      {
        id: 2,
        codigo: "104622011438",
        nombre: "Carlos",
        apellido: "Martinez",
        programa: "Ingeniería Civil",
        creditosObligatorios: "75",
        periodosMatriculados: "7",
        porcentajeAvance: "35%",
      },
    ]);
    setNextId(3);
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
                <div className="inactives-actions">
                  <Button variant="secondary" onClick={detectInactives}>
                    Detectar inactivos
                  </Button>
                  <Button variant="primary" onClick={addEmptyRow}>
                    Añadir estudiante
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="inactives-actions">
                  <Button variant="secondary" onClick={addEmptyRow}>
                    Añadir estudiante
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setInactiveRows([])}
                  >
                    Limpiar lista
                  </Button>
                </div>

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
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cerrar
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Continuar
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
