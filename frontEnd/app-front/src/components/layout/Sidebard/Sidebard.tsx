import React from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  FaHome,
  FaUserGraduate,
  FaBook,
  FaBookOpen,
  FaFileAlt
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

const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: FaHome, roles: ["admin"] },
  { label: "Oferta", path: "/offer", icon: FaUserGraduate, roles: ["admin", "asignador"] },
  { label: "Electivas", path: "/electives", icon: FaBook, roles: ["admin", "asignador"] },
  { label: "Programas", path: "/programs", icon: FaBookOpen, roles: ["admin"] },
  { label: "Reportes", path: "/reportes", icon: FaFileAlt, roles: ["admin"] },
];

const Sidebar: React.FC<SidebardProps> = ({ onRoleChange, currentRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleClick = (role: "admin" | "asignador") => {
    onRoleChange(role);
    navigate(role === "admin" ? "/dashboard" : "/assignment-module");
  };

  return (
    <aside className="sidebard-container">
      <div>
        {/* Menú lateral */}
        <nav className="sidebard-links">
          {menuItems
            .filter(item => item.roles.includes(currentRole))
            .map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={location.pathname.startsWith(item.path) ? "active" : ""}
                >
                  <Icon className="sidebard-icon" /> {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Selector de rol */}
        <div className="sidebard-roles">
          {["admin", "asignador"].map(role => (
            <button
              key={role}
              className={`sidebard-role-btn${currentRole === role ? " active" : ""}`}
              onClick={() => handleRoleClick(role as "admin" | "asignador")}
            >
              {role === "admin" ? "Módulo de administración" : "Módulo de asignación"}
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
          <div className="sidebard-profile-name">Prof. Juan Pérez</div>
          <div className="sidebard-profile-role">
            {currentRole === "admin" ? "Administrador" : "Asignador"}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;