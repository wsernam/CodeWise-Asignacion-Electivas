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
import { useAuthStore } from "../../../store/Auth/authStore";
import type { IconType } from "react-icons";
import "./Sidebard.css";

interface SidebardProps {
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: IconType;
  roles: Array<"administrador" | "asignador">;
}

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    path: "/dashboard",
    icon: FaHome,
    roles: ["administrador"],
  },
  {
    label: "Oferta",
    path: "/offer",
    icon: FaUserGraduate,
    roles: ["administrador"],
  },
  {
    label: "Electivas",
    path: "/electives",
    icon: FaBook,
    roles: ["administrador"],
  },
  {
    label: "Programas",
    path: "/programs",
    icon: FaBookOpen,
    roles: ["administrador"],
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
    roles: ["administrador"],
  },
];

const Sidebar: React.FC<SidebardProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userId } = useAuthStore();

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
            .filter((item) => item.roles.includes(role!))
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
      </div>

      {/* Perfil */}
      <div className="sidebard-profile">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="profile"
          className="sidebard-profile-img"
        />
        <div>
          <div className="sidebard-profile-name">{userId || "Usuario"}</div>
          <div className="sidebard-profile-role">
            {role === "administrador"
              ? "Módulo formulario"
              : role === "asignador"
              ? "Módulo asignación"
              : "Usuario"}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
