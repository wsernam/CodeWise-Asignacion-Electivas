import React from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  FaHome,
  FaUserGraduate,
  FaBook,
  FaBookOpen,
  FaFileAlt,
  FaClipboardList,
  FaFileSignature,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import "./Sidebard.css";

interface SidebardProps {
  onRoleChange: (role: "admin" | "asignador") => void;
  currentRole: "admin" | "asignador";
}

interface MenuItem {
  label: string;
  path: string;
  icon: IconType;
  roles: Array<"admin" | "asignador">;
}

// CORRECCIÓN: Ambos roles tienen dashboard como inicio
const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    path: "/dashboard",
    icon: FaHome,
    roles: ["admin", "asignador"],
  },
  {
    label: "Oferta",
    path: "/offer",
    icon: FaUserGraduate,
    roles: ["admin", "asignador"],
  },
  {
    label: "Electivas",
    path: "/electives",
    icon: FaBook,
    roles: ["admin", "asignador"],
  },
  {
    label: "Programas",
    path: "/programs",
    icon: FaBookOpen,
    roles: ["admin"],
  },
  {
    label: "Reportes Asignación",
    path: "/reportes-asignacion",
    icon: FaClipboardList,
    roles: ["asignador"],
  },
  {
    label: "Reportes Formulario",
    path: "/reportes-formularios",
    icon: FaFileSignature,
    roles: ["admin"],
  },
  {
    label: "Proceso Asignación",
    path: "/assignment-module",
    icon: FaClipboardList,
    roles: ["asignador"],
  },
];

const Sidebar: React.FC<SidebardProps> = ({ onRoleChange, currentRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleClick = (role: "admin" | "asignador") => {
    onRoleChange(role);
    // CORRECCIÓN: Ambos roles van al dashboard al cambiar
    navigate("/dashboard");
  };

  return (
    <aside className="sidebard-container">
      <div>
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
