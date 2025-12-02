import React from "react";
import { useState } from "react";
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
import adminIcon from "../../../assets/icon-admin.png";
import asigIcon from "../../../assets/icon-assig.png";
import ambosIcon from "../../../assets/icon-ambos.png";
import type { IconType } from "react-icons";
import "./Sidebard.css";

interface SidebardProps {
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: IconType;
  roles: Array<"administrador" | "asignador" | "ambos">;
}

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    path: "/dashboard",
    icon: FaHome,
    roles: ["administrador", "ambos"],
  },
  {
    label: "Oferta",
    path: "/offer",
    icon: FaUserGraduate,
    roles: ["administrador", "ambos"],
  },
  {
    label: "Electivas",
    path: "/electives",
    icon: FaBook,
    roles: ["administrador", "ambos"],
  },
  {
    label: "Programas",
    path: "/programs",
    icon: FaBookOpen,
    roles: ["administrador", "ambos"],
  },
  {
    label: "Proceso Asignación",
    path: "/assignment-module",
    icon: FaClipboardList,
    roles: ["asignador", "ambos"],
  },
  {
    label: "Reportes Asignación",
    path: "/reports-assignment",
    icon: FaFileSignature,
    roles: ["asignador", "ambos"],
  },
  {
    label: "Reportes Formulario",
    path: "/reports-form",
    icon: FaFileSignature,
    roles: ["administrador", "ambos"],
  },
];

const Sidebar: React.FC<SidebardProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userId, username } = useAuthStore();
  const [currentModule, setCurrentModule] = useState<"admin" | "asignador">(
    role === "asignador" ? "asignador" : "admin"
  );
  const handleModuleSwitch = (module: "admin" | "asignador") => {
    setCurrentModule(module);

    // Redirigir según el módulo seleccionado
    if (module === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/assignment-module");
    }
  };
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
        {/* Selector de módulo solo para rol "ambos" */}
        {role === "ambos" && (
          <div className="sidebard-module-selector">
            <button
              className={`sidebard-module-btn${
                currentModule === "admin" ? " active" : ""
              }`}
              onClick={() => handleModuleSwitch("admin")}
            >
              Módulo formulario
            </button>
            <button
              className={`sidebard-module-btn${
                currentModule === "asignador" ? " active" : ""
              }`}
              onClick={() => handleModuleSwitch("asignador")}
            >
              Módulo asignación
            </button>
          </div>
        )}
        {/* Menú lateral */}
        <nav className="sidebard-links">
          {menuItems
            .filter((item) => {
              if (role === "ambos") {
                if (currentModule === "admin") {
                  return item.roles.includes("administrador");
                } else {
                  return item.roles.includes("asignador");
                }
              }
              // Para otros roles, filtrar normi
              return item.roles.includes(role!);
            })
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
          src={
            role === "administrador"
              ? adminIcon
              : role === "asignador"
              ? asigIcon
              : ambosIcon
          }
          className="sidebard-profile-img"
        />

        <div className="sidebard-profile-info">
          <div className="sidebard-profile-name">{username || "Usuario"}</div>
          <div className="sidebard-profile-role">
            {role === "ambos"
              ? currentModule === "admin"
                ? "Módulo formulario"
                : "Módulo asignación"
              : role === "administrador"
              ? "Módulo formulario"
              : "Módulo asignación"}
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
