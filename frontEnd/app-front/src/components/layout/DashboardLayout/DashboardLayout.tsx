import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebard/Sidebard";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ProtectedRoute from "../../Auth/ProtectedRoute";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: Array<"administrador" | "asignador" | "ambos">;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  allowedRoles = ["administrador", "asignador", "ambos"],
}) => {
  const [currentRole, setCurrentRole] = useState<
    "admin" | "asignador" | "ambos"
  >("admin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("currentRole") as
      | "admin"
      | "asignador"
      | null;
    if (savedRole) setCurrentRole(savedRole);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
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
          <Sidebar onClose={closeSidebar} />
        </aside>

        <div className="dashboard-content">
          <main className="dashboard-main">
            <div className="dashboard-main-inner">{children}</div>
          </main>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
