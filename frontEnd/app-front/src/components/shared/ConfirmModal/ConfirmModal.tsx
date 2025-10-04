import React from "react";
import { Modal } from "antd";
import "./ConfirmModal.css";

interface ConfirmModalProps {
  open: boolean; // Controla si el modal se muestra
  message: string; // Mensaje que explica la acción a confirmar
  onConfirm: () => void; // Función que se ejecuta si el usuario confirma
  onCancel: () => void; // Función que se ejecuta si el usuario cancela
}

/**
 * ConfirmModal: Modal para pedir confirmación al usuario
 * Tiene botones "Sí" y "No" para decidir
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      title={<span className="confirm-title">🔔 Confirmación</span>} // Título con ícono
      open={open} // Mostrar/ocultar modal
      onOk={onConfirm} // Acción al hacer clic en "Sí"
      onCancel={onCancel} // Acción al hacer clic en "No" o fuera del modal
      okText="Sí" // Texto del botón confirmar
      cancelText="No" // Texto del botón cancelar
      centered // Centrado en pantalla
      className="confirm-modal"
    >
      <p className="confirm-message">{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
