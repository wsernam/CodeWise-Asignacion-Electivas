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
    return <Navigate to="/login-admin" replace />;
  }

  // Si se especifican roles y el usuario no tiene permiso
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todo está bien, renderizar los children
  return <>{children}</>;
};

export default ProtectedRoute;
