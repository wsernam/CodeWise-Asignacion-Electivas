// src/components/ui/Card/Card.tsx - VERSIÓN MEJORADA
import React from "react";
import "./Card.css";

interface CardProps {
  children: React.ReactNode;
  padding?: "sm" | "lg" | "xl";
  maxWidth?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = "lg",
  maxWidth,
  className = "",
}) => {
  const cardStyle: React.CSSProperties = {
    maxWidth: maxWidth || "100%",
    width: "100%",
  };

  return (
    <div
      className={`card card-padding-${padding} ${className}`}
      style={cardStyle}
    >
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
