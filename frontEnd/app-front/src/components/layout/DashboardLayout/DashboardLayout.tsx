import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebard/Sidebard";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<"admin" | "asignador">(
    "admin"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("currentRole") as
      | "admin"
      | "asignador"
      | null;
    if (savedRole) setCurrentRole(savedRole);
  }, []);

  const handleRoleChange = (role: "admin" | "asignador") => {
    setCurrentRole(role);
    localStorage.setItem("currentRole", role);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Header />

      {/* Botón de 3 rayas - SE OCULTA cuando sidebar está abierto */}
      {!isSidebarOpen && (
        <button
          className="sidebar-hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      )}

      {/* Overlay oscuro cuando sidebar está abierto */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar - COMPLETO cuando está abierto */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <Sidebar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onClose={closeSidebar}
        />
      </aside>

      <div className="dashboard-content">
        <main className="dashboard-main">
          <div className="dashboard-main-inner">{children}</div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
