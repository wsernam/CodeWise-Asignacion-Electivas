import React, { useState } from "react";

//Styles
import {
    FaInfoCircle
} from "react-icons/fa";

import SimpleModal from "../../../components/shared/SimpleModal/SimpleModal";
import Button from "../../../components/ui/Button/Button";


import CreateAssignmentProcess from "./CreateProcess/CreateAssignmentProcess";

// --- added: inline style object ---
const styles: { [k: string]: React.CSSProperties } = {
    header: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#5B2EA6",
        fontSize: 32,
        lineHeight: 1
    },
    textWrapper: {
        flex: 1
    },
    title: {
        margin: 0,
        fontSize: 18,
        color: "#08326B",
        fontWeight: 700
    }
};

type AssignmentProcessProps = {
    onNext: () => void;
    onCancel: () => void;
};

const ResumeAssignmetProcess: React.FC<AssignmentProcessProps> = ({ onNext }) => {

    // ========== STATES ==========
    const [showModal, setShowModal] = useState(false); 

    return (
        <>
            <div style={styles.header}>
                <div style={styles.iconWrapper}>
                    <FaInfoCircle className="step-header-icon" />
                </div>
                <div style={styles.textWrapper}>
                    <h2 style={styles.title}>No hay un proceso de selección activo</h2>
                </div>
            </div>
            <div style={{ marginTop: 24, textAlign: "center" }}>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Crear Proceso de Asignación
                </Button>
            </div>

            <SimpleModal open={showModal} onClose={() => setShowModal(false)} title="Crear Proceso de Asignación">
                <CreateAssignmentProcess 
                    onCancel={() => setShowModal(false)} 
                    onNext={() => {
                        setShowModal(false); 
                        onNext();
                    }} 
                />
            </SimpleModal>
        </>
    )
}

export default ResumeAssignmetProcess;