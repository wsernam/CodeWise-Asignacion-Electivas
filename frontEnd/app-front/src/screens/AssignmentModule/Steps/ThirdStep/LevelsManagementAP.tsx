import React, { useState } from "react";

// Styles
import "../AssignmentProcessSteps.css";

// Icons
import {
  FaUserSlash,
  FaUserCheck,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";

// UI Components
import Button from "../../../../components/ui/Button/Button";
import SimpleModal from "../../../../components/shared/SimpleModal/SimpleModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";

type AssignmentProcessProps = {
  onNext: () => void;
  onCancel: () => void;
};

// Define the structure of a leveled student
type LeveledStudent = {
  codigo: string;
  nombre: string;
  apellido: string;
  programa: string;
  creditosObligatorios: string;
  periodosMatriculados: string;
  porcentajeAvance: string;
  confirmado: boolean; // Nuevo campo para confirmación manual
};

const cards = [
  {
    id: 1,
    title: "\nCargar archivos\n\n",
    borderClass: "green",
    icon: <FaFileAlt className="aps-icon aps-file" />,
  },
  {
    id: 2,
    title: "Gestion de potenciales\ninactivos",
    borderClass: "green",
    icon: <FaUserSlash className="aps-icon aps-user-slash" />,
  },
  {
    id: 3,
    title: "Gestion de potenciales\nnivelados",
    borderClass: "red",
    icon: <FaUserCheck className="aps-icon aps-user-check" />,
  },
  {
    id: 4,
    title: "\nAsignacion\n\n",
    borderClass: "red",
    icon: <FaClipboardList className="aps-icon aps-clipboard" />,
  },
];

const LevelsManagementAP: React.FC<AssignmentProcessProps> = ({
  onNext,
  onCancel,
}) => {
  // ========== STATES ==========
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [leveledStudents, setLeveledStudents] = useState<LeveledStudent[]>([]);

  // ========== MANEJADORES ==========
  const handleManageClick = () => {
    // Simular carga de datos del backend
    loadLeveledStudents();
    setShowModal(true);
  };

  const handleSave = () => {
    // Verificar que al menos un estudiante esté confirmado
    const confirmedCount = leveledStudents.filter(
      (student) => student.confirmado
    ).length;
    if (confirmedCount === 0) {
      alert(
        "Debe confirmar al menos un estudiante como nivelado para continuar."
      );
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    setShowConfirm(false);
    setShowModal(false);
    if (onNext) onNext();
  };

  // Simular carga de datos del backend
  const loadLeveledStudents = () => {
    // Datos de ejemplo - en producción vendrían del backend
    const mockData: LeveledStudent[] = [
      {
        codigo: "104622011437",
        nombre: "Lina",
        apellido: "Diaz",
        programa: "Ingeniería de Sistemas",
        creditosObligatorios: "80",
        periodosMatriculados: "8",
        porcentajeAvance: "40%",
        confirmado: false,
      },
      {
        codigo: "104622011438",
        nombre: "Carlos",
        apellido: "Martinez",
        programa: "Ingeniería Civil",
        creditosObligatorios: "75",
        periodosMatriculados: "7",
        porcentajeAvance: "35%",
        confirmado: false,
      },
      {
        codigo: "104622011439",
        nombre: "Ana",
        apellido: "Gomez",
        programa: "Ingeniería Industrial",
        creditosObligatorios: "82",
        periodosMatriculados: "9",
        porcentajeAvance: "45%",
        confirmado: false,
      },
    ];
    setLeveledStudents(mockData);
  };

  const toggleConfirmation = (codigo: string) => {
    setLeveledStudents((prev) =>
      prev.map((student) =>
        student.codigo === codigo
          ? { ...student, confirmado: !student.confirmado }
          : student
      )
    );
  };

  const getStatusText = (confirmado: boolean) => {
    return confirmado ? "Nivelado" : "Por confirmar";
  };

  const getStatusClass = (confirmado: boolean) => {
    return confirmado ? "tag--green" : "tag--default";
  };

  const confirmedCount = leveledStudents.filter(
    (student) => student.confirmado
  ).length;

  return (
    <div className="aps-wrapper">
      <div className="aps-grid">
        {cards.map((card) => (
          <div key={card.id} className={`aps-card-wrap ${card.borderClass}`}>
            <div className="aps-inner">
              <div className="aps-icon-box">{card.icon}</div>
            </div>

            <div className="aps-title">{card.title}</div>
          </div>
        ))}
      </div>

      <div className="aps-action-bar">
        <Button variant="primary" onClick={handleManageClick}>
          Gestionar potenciales nivelados
        </Button>
      </div>

      <SimpleModal
        open={showModal}
        title="Gestión de potenciales nivelados"
        onClose={() => setShowModal(false)}
      >
        <div className="im-modal-content">
          {leveledStudents.length === 0 ? (
            <div className="im-empty">
              <p>No se han identificado potenciales estudiantes nivelados</p>
              <div className="actions">
                <Button variant="primary" onClick={loadLeveledStudents}>
                  Cargar estudiantes nivelados
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="im-status-wrapper"
                style={{ marginBottom: "16px" }}
              >
                <small>Estudiantes confirmados: </small>
                <strong>
                  {confirmedCount} de {leveledStudents.length}
                </strong>
              </div>

              <table className="im-table">
                <thead>
                  <tr>
                    <th className="im-th">Código</th>
                    <th className="im-th">Nombre</th>
                    <th className="im-th">Apellido</th>
                    <th className="im-th">Programa</th>
                    <th className="im-th">Cr. oblig.</th>
                    <th className="im-th">Periodos</th>
                    <th className="im-th">% avance</th>
                    <th className="im-th">Estado</th>
                    <th className="im-th">Confirmar</th>
                  </tr>
                </thead>
                <tbody>
                  {leveledStudents.map((student) => (
                    <tr key={student.codigo}>
                      <td className="im-cell">{student.codigo}</td>
                      <td className="im-cell">{student.nombre}</td>
                      <td className="im-cell">{student.apellido}</td>
                      <td className="im-cell">{student.programa}</td>
                      <td className="im-cell">
                        {student.creditosObligatorios}
                      </td>
                      <td className="im-cell">
                        {student.periodosMatriculados}
                      </td>
                      <td className="im-cell">{student.porcentajeAvance}</td>
                      <td className="im-cell">
                        <span className={getStatusClass(student.confirmado)}>
                          {getStatusText(student.confirmado)}
                        </span>
                      </td>
                      <td className="im-cell">
                        <input
                          type="checkbox"
                          checked={student.confirmado}
                          onChange={() => toggleConfirmation(student.codigo)}
                          style={{ transform: "scale(1.2)" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="im-small-actions">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cerrar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={confirmedCount === 0}
                >
                  Confirmar nivelados ({confirmedCount})
                </Button>
              </div>
            </>
          )}
        </div>
      </SimpleModal>

      <ConfirmModal
        open={showConfirm}
        message={`¿Está seguro de confirmar ${confirmedCount} estudiante(s) como nivelados y continuar?`}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default LevelsManagementAP;
