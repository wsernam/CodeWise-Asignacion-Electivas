import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import SimpleModal from "../../../components/shared/SimpleModal/SimpleModal";
import Button from "../../../components/ui/Button/Button";
import CreateAssignmentProcess from "./CreateProcess/CreateAssignmentProcess";

type AssignmentProcessProps = {
  onNext: () => void;
  onCancel: () => void;
};

const ResumeAssignmetProcess: React.FC<AssignmentProcessProps> = ({
  onNext,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="no-active-process">
      <div className="no-process-header">
        <FaInfoCircle className="info-icon" />
        <h3>No hay procesos de asignación activos</h3>
      </div>

      <div className="no-process-actions">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Crear
        </Button>
      </div>

      <SimpleModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Crear Proceso de Asignación"
      >
        <CreateAssignmentProcess
          onCancel={() => setShowModal(false)}
          onNext={() => {
            setShowModal(false);
            onNext();
          }}
        />
      </SimpleModal>
    </div>
  );
};

export default ResumeAssignmetProcess;
