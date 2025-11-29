import React from "react";
import { Modal } from "antd";
import "./SuccessModal.css";

interface SuccessModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  message,
  onClose,
}) => {
  return (
    <Modal
      title={<span className="success-title">Éxito</span>}
      open={open}
      onOk={onClose}
      onCancel={onClose}
      okText="Aceptar"
      cancelButtonProps={{ style: { display: "none" } }}
      centered
      className="success-modal"
    >
      <p className="success-message">{message}</p>
    </Modal>
  );
};

export default SuccessModal;
