// AssignmentProcessSteps.tsx
import React from "react";

// Styles
import "../AssignmentProcessSteps.css";
import { Input, Tag } from "antd";

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

// Define the structure of an inactive row
type InactiveRow = {
    codigo: string;
    nombre: string;
    apellido: string;
    programa: string;
    creditosObligatorios?: string;
    periodosMatriculados?: string;
    porcentajeAvance?: string;
};


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
        borderClass: "red",
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

const InactivesManagementAP: React.FC<AssignmentProcessProps> = ({ onNext }) => {

    // ========== STATES ==========
    const [showModal, setShowModal] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [inactiveRows, setInactiveRows] = React.useState<InactiveRow[]>([]);

    // ========== MANEJADORES ==========
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

    const addEmptyRow = () => {
        setInactiveRows(prevRows => [
            ...prevRows,
            {
                codigo: "",
                nombre: "",
                apellido: "",
                programa: "",
                creditosObligatorios: "",
                periodosMatriculados: "",
                porcentajeAvance: ""
            }
        ]);
    }

    // Simula deteccion de inactivos
    // REEMPLAZAR CON IMPLEMENTACION REAL
    const detectInactives = () => {
        setInactiveRows([
            {
                codigo: "104622011437",
                nombre: "Lina",
                apellido: "Diaz",
                programa: "Ingeniería de Sistemas",
                creditosObligatorios: "80",
                periodosMatriculados: "8",
                porcentajeAvance: "40%"
            },
            {
                codigo: "104622011438",
                nombre: "",
                apellido: "",
                programa: "",
                creditosObligatorios: "",
                periodosMatriculados: "",
                porcentajeAvance: ""
            }
        ]);
    };

    const handleChangeField = (codigo: string, field: keyof InactiveRow, value: string) => {
        setInactiveRows(prev =>
            prev.map(r => (r.codigo === codigo ? { ...r, [field]: value } : r))
        );
    };

    const removeRow = (codigo: string) => {
        setInactiveRows(prev => prev.filter(r => r.codigo !== codigo));
    };

    const isActive = (row: InactiveRow) => {
        // Condicion: todos los campos llenos
        return (
            row.codigo.trim() !== "" &&
            row.nombre.trim() !== "" &&
            row.apellido.trim() !== "" &&
            row.programa.trim() !== "" &&
            row.creditosObligatorios?.trim() !== "" &&
            row.periodosMatriculados?.trim() !== "" &&
            row.porcentajeAvance?.trim() !== ""
        );
    };

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
                    Verificar posibles inactivos
                </Button>

            </div>

            <SimpleModal open={showModal} title="Gestion de potenciales inactivos" onClose={() => setShowModal(false)}>
                {/* reemplazar style por className */}
                <div className="im-modal-content">
                    {inactiveRows.length === 0 ? (
                        <div className="im-empty">
                            <p>No se han identificado posibles estudiantes inactivos</p>
                            <div className="actions">
                                <Button variant="secondary" onClick={detectInactives} className="im-add-btn">
                                    Detectar inactivos (simular)
                                </Button>
                                <Button variant="primary" onClick={addEmptyRow}>
                                    Añadir estudiante manualmente
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <div>
                                    <Button variant="secondary" onClick={addEmptyRow} className="im-add-btn">
                                        Añadir estudiante
                                    </Button>
                                    <Button variant="secondary" onClick={() => setInactiveRows([])} className="im-clear-btn">
                                        Limpiar lista
                                    </Button>
                                </div>
                                <div className="im-status-wrapper">
                                    <small style={{ color: "#666" }}>Estado: </small>
                                    <span className="tag--green">Activo</span>
                                    <span className="tag--default">Incompleto</span>
                                </div>
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
                                        <th className="im-th"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inactiveRows.map((row, idx) => (
                                        <tr key={row.codigo}>
                                            <td>
                                                <Input
                                                    placeholder="Código"
                                                    value={row.codigo}
                                                    onChange={e => handleChangeField(row.codigo, "codigo", e.target.value)}
                                                    size="small"
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    placeholder="Nombre"
                                                    value={row.nombre}
                                                    onChange={e => handleChangeField(row.codigo, "nombre", e.target.value)}
                                                    size="small"
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    placeholder="Apellido"
                                                    value={row.apellido}
                                                    onChange={e => handleChangeField(row.codigo, "apellido", e.target.value)}
                                                    size="small"
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    placeholder="Programa"
                                                    value={row.programa}
                                                    onChange={e => handleChangeField(row.codigo, "programa", e.target.value)}
                                                    size="small"
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    placeholder="0"
                                                    value={row.creditosObligatorios}
                                                    onChange={e => handleChangeField(row.codigo, "creditosObligatorios", e.target.value)}
                                                    size="small"
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    placeholder="0"
                                                    value={row.periodosMatriculados}
                                                    onChange={e => handleChangeField(row.codigo, "periodosMatriculados", e.target.value)}
                                                    size="small"
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    placeholder="0"
                                                    value={row.porcentajeAvance}
                                                    onChange={e => handleChangeField(row.codigo, "porcentajeAvance", e.target.value)}
                                                    size="small"
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
                                                <Button variant="secondary" onClick={() => removeRow(row.codigo)}>Eliminar</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    <div className="im-small-actions">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
                        <Button variant="primary" onClick={handleSave} disabled={inactiveRows.length === 0}>
                            Continuar
                        </Button>
                    </div>
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

export default InactivesManagementAP;
