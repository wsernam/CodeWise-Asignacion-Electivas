import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./SimpleModal.css";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  titleTooltip?: React.ReactNode;
};

const SimpleModal = ({
  open,
  onClose,
  children,
  title,
  titleTooltip,
}: Props) => {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused.current) previouslyFocused.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="sm-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sm-card"
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialogo"}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="sm-close" aria-label="Cerrar" onClick={onClose}>
          ✕
        </button>
        <div className="sm-body">
          {title && <h3 className="sm-title">{title}</h3>}
          {titleTooltip && <h3 className="sm-titleytooltip">{titleTooltip}</h3>}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SimpleModal;
