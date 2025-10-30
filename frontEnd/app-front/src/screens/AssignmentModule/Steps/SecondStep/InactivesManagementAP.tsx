// InactivesManagementAP.tsx - VERSIÓN CON CSS DEDICADO
import React, { useState } from "react";
import "../AssignmentProcessSteps.css";
import "./InactivesTable.css"; // <-- NUEVO CSS
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
    setInactiveRows([...inactiveRows, newRow]);
    setNextId(nextId + 1);
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

  const handleChangeField = (
    id: number,
    field: keyof InactiveRow,
    value: string
  ) => {
    setInactiveRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id: number) => {
    setInactiveRows((prev) => prev.filter((row) => row.id !== id));
  };

  const isActive = (row: InactiveRow) => {
    return row.codigo && row.nombre && row.apellido && row.programa;
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
          <div className="inactives-modal-content">
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
                      {inactiveRows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <input
                              type="text"
                              value={row.codigo}
                              onChange={(e) =>
                                handleChangeField(
                                  row.id,
                                  "codigo",
                                  e.target.value
                                )
                              }
                              className="inactives-input"
                              placeholder="Código"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.nombre}
                              onChange={(e) =>
                                handleChangeField(
                                  row.id,
                                  "nombre",
                                  e.target.value
                                )
                              }
                              className="inactives-input"
                              placeholder="Nombre"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.apellido}
                              onChange={(e) =>
                                handleChangeField(
                                  row.id,
                                  "apellido",
                                  e.target.value
                                )
                              }
                              className="inactives-input"
                              placeholder="Apellido"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.programa}
                              onChange={(e) =>
                                handleChangeField(
                                  row.id,
                                  "programa",
                                  e.target.value
                                )
                              }
                              className="inactives-input"
                              placeholder="Programa"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.creditosObligatorios}
                              onChange={(e) =>
                                handleChangeField(
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
                              value={row.periodosMatriculados}
                              onChange={(e) =>
                                handleChangeField(
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
                              value={row.porcentajeAvance}
                              onChange={(e) =>
                                handleChangeField(
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
                            <Button
                              variant="secondary"
                              onClick={() => removeRow(row.id)}
                            >
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
