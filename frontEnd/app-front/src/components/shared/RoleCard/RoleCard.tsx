// src/components/shared/RoleCard/RoleCard.tsx
import React from "react";
import "./RoleCard.css";

interface RoleCardProps {
  label: string;
  iconType: "student" | "admin";
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ label, iconType, onClick }) => {
  const renderIcon = () => {
    switch (iconType) {
      case "student":
        return (
          <div className="role-icon student-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cabeza simple */}
              <circle cx="12" cy="8" r="3" fill="#3B82F6" />
              {/* Cuerpo simple */}
              <path d="M12 11V18" stroke="#1E40AF" strokeWidth="2" />
              {/* Brazos simples */}
              <path
                d="M8 14L12 11L16 14"
                stroke="#1E40AF"
                strokeWidth="2"
                fill="none"
              />
              {/* Piernas simples */}
              <path
                d="M10 21L12 18L14 21"
                stroke="#1E40AF"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        );
      case "admin":
        return (
          <div className="role-icon admin-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Computador simple */}
              <rect x="5" y="6" width="14" height="10" rx="1" fill="#6B7280" />
              <rect x="6" y="7" width="12" height="8" rx="0.5" fill="#3B82F6" />
              {/* Símbolo de usuario/admin */}
              <circle cx="12" cy="10" r="1.5" fill="white" />
              <path d="M9 13H15" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="role-card" onClick={onClick}>
      {renderIcon()}
      <span className="role-label">{label}</span>
    </div>
  );
};

export default RoleCard;
