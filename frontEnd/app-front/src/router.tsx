// ---------------------- IMPORTS DE PANTALLAS ----------------------
import PreLogin from "./screens/LoginModule/PreLogin.tsx";
import LoginStudent from "./screens/LoginModule/LoginStudent.tsx";
import PersonalInfo from "./screens/StudentModule/PersonalInfo.tsx";
import ElectiveSelection from "./screens/StudentModule/ElectiveSelection.tsx";
import LoginAdmin from "./screens/LoginModule/LoginAdmin.tsx";
import Dashboard from "./screens/FormModule/Dashboard/Dashboard.tsx";
import Electives from "./screens/FormModule/Electives/ListElective.tsx";
import AddElective from "./screens/FormModule/Electives/AddElective.tsx";
import EditElective from "./screens/FormModule/Electives/EditElective.tsx";
import CreateProgram from "./screens/FormModule/Program/CreateProgram.tsx";
import ListProgram from "./screens/FormModule/Program/ListProgram.tsx";
import EditProgram from "./screens/FormModule/Program/EditProgram.tsx";
import Offer from "./screens/FormModule/Offer/Offer.tsx";
import AssignmentModule from "./screens/AssignmentModule/AssignmentModule.tsx";
import ReportsAssignment from "./screens/Reports/ReportsAssignment.tsx";
import ReportsForm from "./screens/Reports/ReportsForm.tsx";
// ---------------------- IMPORTS DE ROUTER ----------------------
import { createBrowserRouter } from "react-router";
import DashboardLayout from "./components/layout/DashboardLayout/DashboardLayout.tsx";

// ---------------------- CONFIGURACIÓN DEL ROUTER ----------------------

// Componente wrapper para aplicar DashboardLayout
const withDashboardLayout = (
  Component: React.ComponentType,
  allowedRoles?: Array<"administrador" | "asignador" | "ambos">
) => {
  return (
    <DashboardLayout allowedRoles={allowedRoles}>
      <Component />
    </DashboardLayout>
  );
};
const router = createBrowserRouter([
  // Estudiantes y Login sin Layout
  {
    path: "/",
    element: <PreLogin />,
  },
  {
    path: "/login-student",
    element: <LoginStudent />,
  },
  {
    path: "/personal-info",
    element: <PersonalInfo />,
  },
  {
    path: "/elective-selection",
    element: <ElectiveSelection />,
  },
  {
    path: "/login-admin",
    element: <LoginAdmin />,
  },
  // Con Dashboard Layout (admin, asignador y ambos)
  {
    path: "/dashboard",
    element: withDashboardLayout(Dashboard, ["administrador", "ambos"]),
  },
  {
    path: "/electives",
    element: withDashboardLayout(Electives, ["administrador", "ambos"]),
  },
  {
    path: "/electives/add",
    element: withDashboardLayout(AddElective, ["administrador", "ambos"]),
  },
  {
    path: "/electives/edit/:ele_codigo",
    element: withDashboardLayout(EditElective, ["administrador", "ambos"]),
  },
  {
    path: "/programs",
    element: withDashboardLayout(ListProgram, ["administrador", "ambos"]),
  },
  {
    path: "/programs/create",
    element: withDashboardLayout(CreateProgram, ["administrador", "ambos"]),
  },
  {
    path: "/programs/edit/:codigo",
    element: withDashboardLayout(EditProgram, ["administrador", "ambos"]),
  },

  {
    path: "/offer",
    element: withDashboardLayout(Offer, ["administrador", "ambos"]),
  },
  {
    path: "/assignment-module",
    element: withDashboardLayout(AssignmentModule, ["asignador", "ambos"]),
  },
  {
    path: "/reports-assignment",
    element: withDashboardLayout(ReportsAssignment, ["asignador", "ambos"]),
  },
  {
    path: "/reports-form",
    element: withDashboardLayout(ReportsForm, ["administrador", "ambos"]),
  },
]);

export default router;
