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
import { FaSignOutAlt } from "react-icons/fa";
import bannerImage from "../../../assets/banner-gestionelectivas.png";
import adminIcon from "../../../assets/icon-admi.png";
import asigIcon from "../../../assets/icon-asig.png";
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
        {onClose && (
          <div className="sidebar-close-header">
            {/* Banner a la izquierda */}
            <div className="sidebar-banner">
              <img
                src={bannerImage}
                alt="Gestión Electivas"
                className="sidebar-banner-img"
              />
            </div>
            {/* Botón de cerrar */}
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

      {/* Perfil y logout */}
      <div className="sidebard-profile">
        {/* Imagen según rol */}
        <img
          src={role === "administrador" ? adminIcon : asigIcon}
          className="sidebard-profile-img"
        />

        <div className="sidebard-profile-info">
          <div className="sidebard-profile-name">{userId || "Usuario"}</div>
          <div className="sidebard-profile-role">
            {role === "administrador"
              ? "Módulo formulario"
              : role === "asignador"
              ? "Módulo asignación"
              : "Módulo completo"}
          </div>
        </div>

        {/* Botón de logout */}
        <button
          className="sidebard-logout-btn"
          onClick={() => useAuthStore.getState().logout()}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
