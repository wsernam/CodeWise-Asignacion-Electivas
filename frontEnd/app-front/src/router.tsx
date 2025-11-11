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
import ReportsAssignment from "./screens/FormModule/Reports/ReportsAssignment.tsx";
import ReportsForm from "./screens/FormModule/Reports/ReportsForm.tsx";
// ---------------------- IMPORTS DE ROUTER ----------------------
import { createBrowserRouter } from "react-router";
import DashboardLayout from "./components/layout/DashboardLayout/DashboardLayout.tsx";

// ---------------------- CONFIGURACIÓN DEL ROUTER ----------------------

// Componente wrapper para aplicar DashboardLayout
const withDashboardLayout = (Component: React.ComponentType) => {
  return (
    <DashboardLayout>
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
  // Con Dashboard Layout (admin y asignador)
  {
    path: "/dashboard",
    element: withDashboardLayout(Dashboard),
  },
  {
    path: "/electives",
    element: withDashboardLayout(Electives),
  },
  {
    path: "/electives/add",
    element: withDashboardLayout(AddElective),
  },
  {
    path: "/electives/edit/:ele_codigo",
    element: withDashboardLayout(EditElective),
  },
  {
    path: "/programs",
    element: withDashboardLayout(ListProgram),
  },
  {
    path: "/programs/create",
    element: withDashboardLayout(CreateProgram),
  },
  {
    path: "/programs/edit/:codigo",
    element: withDashboardLayout(EditProgram),
  },
  {
    path: "/offer",
    element: withDashboardLayout(Offer),
  },
  {
    path: "/assignment-module",
    element: withDashboardLayout(AssignmentModule),
  },
  {
    path: "/reports-assignment",
    element: withDashboardLayout(ReportsAssignment),
  },
  {
    path: "/reports-form",
    element: withDashboardLayout(ReportsForm),
  },
]);

export default router;
