import React from "react";
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
  const { token, role } = useAuthStore();

  // Si no hay token, redirigir al login
  if (!token) {
    console.log("ProtectedRoute: No hay token, redirigiendo a /");
    return <Navigate to="/" replace />;
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
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute: Acceso permitido para rol", role);

  // Si todo está bien, renderizar los children
  return <>{children}</>;
};

export default ProtectedRoute;
