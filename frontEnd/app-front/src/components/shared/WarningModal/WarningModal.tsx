import React from "react";
import { Modal } from "antd";
import "./WarningModal.css";

interface WarningModalProps {
  open: boolean; // Controla si el modal se muestra o no
  message: string; // Mensaje que se mostrará dentro del modal
  onClose: () => void; // Función que se llama al cerrar el modal
}

/**
 * WarningModal: Modal de advertencia para informar al usuario
 * Solo tiene un botón "Entendido" para cerrar
 */
const WarningModal: React.FC<WarningModalProps> = ({
  open,
  message,
  onClose,
}) => {
  return (
    <Modal
      title={<span className="warning-title">⚠ Advertencia</span>} // Título con ícono
      open={open} // Mostrar/ocultar modal
      onOk={onClose} // Acción al hacer clic en "Entendido"
      onCancel={onClose} // También cierra al hacer clic fuera del modal o cancelar
      okText="Entendido" // Texto del botón principal
      cancelButtonProps={{ style: { display: "none" } }} // Oculta botón de cancelar
      centered // Centrado en pantalla
      className="warning-modal"
    >
      <p className="warning-message">{message}</p>
    </Modal>
  );
};

export default WarningModal;
