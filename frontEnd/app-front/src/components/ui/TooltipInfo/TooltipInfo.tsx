import React from "react";
import "./TooltipInfo.css";

interface TooltipInfoProps {
  symbol?: string;
  title?: string;
  subtitle?: string;
  description: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  size?: "small" | "medium";
}

const TooltipInfo: React.FC<TooltipInfoProps> = ({
  symbol = "!",
  title,
  subtitle,
  description,
  position = "left",
  size = "small",
}) => {
  return (
    <div className="tooltip-info-container">
      <div
        className={`tooltip-info-icon tooltip-info-icon-${size}`}
        aria-describedby={`tooltip-${symbol}`}
      >
        {symbol}
      </div>

      <div
        className={`tooltip-info-content tooltip-info-content-${position}`}
        role="tooltip"
        id={`tooltip-${symbol}`}
      >
        {title && <div className="tooltip-info-title">{title}</div>}
        {subtitle && <div className="tooltip-info-subtitle">{subtitle}</div>}
        <div className="tooltip-info-description">{description}</div>
      </div>
    </div>
  );
};

export default TooltipInfo;
