import React, { useEffect } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "../../store/Auth/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"administrador" | "asignador" | "ambos">;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { token, role, isInitialized, loading, initializeAuth } = useAuthStore();

  // Inicializar autenticación al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Mientras está cargando o inicializando, mostrar loading
  if (loading || !isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Verificando sesión...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no hay token después de inicializar, redirigir al login
  if (!token) {
    console.log("ProtectedRoute: No hay token, redirigiendo a /");
    return <Navigate to="/login-admin" replace />;
  }

  // Si se especifican roles y el usuario no tiene permiso
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log(
      `ProtectedRoute: Rol ${role} no permitido. Roles permitidos:`,
      allowedRoles
    );

    // Redirigir según el rol del usuario
    if (role === "administrador" || role === "ambos") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "asignador") {
      return <Navigate to="/assignment-module" replace />;
    }
    return <Navigate to="/login-admin" replace />;
  }

  console.log("ProtectedRoute: Acceso permitido para rol", role);

  // Si todo está bien, renderizar los children
  return <>{children}</>;
};

export default ProtectedRoute;