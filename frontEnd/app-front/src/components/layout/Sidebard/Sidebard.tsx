import React from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  FaHome,
  FaUserGraduate,
  FaBook,
  FaBookOpen,
  FaClipboardList,
  FaFileSignature,
  FaTimes,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import "./Sidebard.css";

interface SidebardProps {
  onRoleChange: (role: "admin" | "asignador") => void;
  currentRole: "admin" | "asignador";
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: IconType;
  roles: Array<"admin" | "asignador">;
}

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    path: "/dashboard",
    icon: FaHome,
    roles: ["admin"],
  },
  {
    label: "Oferta",
    path: "/offer",
    icon: FaUserGraduate,
    roles: ["admin"],
  },
  {
    label: "Electivas",
    path: "/electives",
    icon: FaBook,
    roles: ["admin"],
  },
  {
    label: "Programas",
    path: "/programs",
    icon: FaBookOpen,
    roles: ["admin"],
  },
  {
    label: "Proceso Asignación",
    path: "/assignment-module",
    icon: FaClipboardList,
    roles: ["asignador"],
  },
  {
    label: "Reportes Asignación",
    path: "/reports-assignment",
    icon: FaClipboardList,
    roles: ["asignador"],
  },
  {
    label: "Reportes Formulario",
    path: "/reports-form",
    icon: FaFileSignature,
    roles: ["admin"],
  },
];

const Sidebar: React.FC<SidebardProps> = ({
  onRoleChange,
  currentRole,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleClick = (role: "admin" | "asignador") => {
    onRoleChange(role);
    navigate("/dashboard");
  };

  return (
    <aside className="sidebard-container">
      <div>
        {/* Botón de cerrar - NUEVO */}
        {onClose && (
          <div className="sidebar-close-header">
            <button
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Menú lateral */}
        <nav className="sidebard-links">
          {menuItems
            .filter((item) => item.roles.includes(currentRole))
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    location.pathname.startsWith(item.path) ? "active" : ""
                  }
                >
                  <Icon className="sidebard-icon" /> {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Selector de rol */}
        <div className="sidebard-roles">
          {["admin", "asignador"].map((role) => (
            <button
              key={role}
              className={`sidebard-role-btn${
                currentRole === role ? " active" : ""
              }`}
              onClick={() => handleRoleClick(role as "admin" | "asignador")}
            >
              {role === "admin" ? "Módulo formulario" : "Módulo asignación"}
            </button>
          ))}
        </div>
      </div>

      {/* Perfil */}
      <div className="sidebard-profile">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="profile"
          className="sidebard-profile-img"
        />
        <div>
          <div className="sidebard-profile-name">Username</div>
          <div className="sidebard-profile-role">
            {currentRole === "admin"
              ? "Modulo formulario"
              : "Modulo asignacion"}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
