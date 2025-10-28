// AssignmentProcessSteps.tsx
import React from "react";

// Styles
import "../AssignmentProcessSteps.css";

// Icons
import {
    FaUserSlash,
    FaUserCheck,
    FaFileAlt,
    FaClipboardList
} from "react-icons/fa";

// UI Components
import Button from "../../../../components/ui/Button/Button";
import SimpleModal from "../../../../components/shared/SimpleModal/SimpleModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";

type AssignmentProcessProps = {
    onNext: () => void;
    onCancel: () => void;
};

// ...existing code...
const cards = [
    {
        id: 1,
        title: "\nCargar archivos\n\n",
        borderClass: "green",
        icon: <FaFileAlt className="aps-icon aps-file" />
    },
    {
        id: 2,
        title: "Gestion de potenciales\ninactivos",
        borderClass: "green",
        icon: <FaUserSlash className="aps-icon aps-user-slash" />
    },
    {
        id: 3,
        title: "Gestion de potenciales\nnivelados",
        borderClass: "red",
        icon: <FaUserCheck className="aps-icon aps-user-check" />
    },
    {
        id: 4,
        title: "\nAsignacion\n\n",
        borderClass: "red",
        icon: <FaClipboardList className="aps-icon aps-clipboard" />
    }
];

const LevelsManagementAP: React.FC<AssignmentProcessProps> = ({ onNext }) => {

    const [showModal, setShowModal] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleUploadClick = () => {
        setShowModal(true);
    }

    const handleSave = () => {
        setShowConfirm(true);
    }

    const handleConfirmSave = () => {
        setShowConfirm(false);
        setShowModal(false);
        if (onNext) onNext();
    }

    return (
        <div className="aps-wrapper">
            <div className="aps-grid">
                {cards.map(card => (
                    <div key={card.id} className={`aps-card-wrap ${card.borderClass}`}>
                        <div className="aps-inner">
                            <div className="aps-icon-box">
                                {card.icon}
                            </div>
                        </div>

                        <div className="aps-title">
                            {card.title}
                        </div>
                    </div>
                ))}
            </div>

            <div className="aps-action-bar">
                <Button
                    variant="primary"
                    onClick={handleUploadClick}
                >
                    Subir archivos
                </Button>

            </div>

            <SimpleModal open={showModal} title="Seleccionador de archivos Excel" onClose={() => setShowModal(false)}>
                

                <div className="aps-step-buttons">
                    <Button variant="primary" onClick={handleSave}>Continuar</Button>
                </div>
            </SimpleModal>

            <ConfirmModal
                open={showConfirm}
                message={`¿Está seguro de guardar este paso y continuar?`}
                onConfirm={() => { handleConfirmSave(); }}
                onCancel={() => setShowConfirm(false)}
            />

        </div>
    );
};

export default LevelsManagementAP;
