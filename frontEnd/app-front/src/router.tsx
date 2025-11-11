// ---------------------- IMPORTS DE PANTALLAS ----------------------
import PreLogin from "./screens/PreLogin/PreLogin.tsx";
import LoginStudent from "./screens/LoginStudent/LoginStudent.tsx";
import PersonalInfo from "./screens/Student/PersonalInfo.tsx";
import ElectiveSelection from "./screens/Student/ElectiveSelection.tsx";
import LoginAdmin from "./screens/LoginAdmin/LoginAdmin.tsx";
import Dashboard from "./screens/Dashboard/Dashboard.tsx";
import Electives from "./screens/Electives/ListElective.tsx";
import AddElective from "./screens/Electives/AddElective";
import EditElective from "./screens/Electives/EditElective.tsx";
import CreateProgram from "./screens/Program/CreateProgram.tsx";
import ListProgram from "./screens/Program/ListProgram.tsx";
import EditProgram from "./screens/Program/EditProgram.tsx";
import Offer from "./screens/Offer/Offer.tsx";
import AssignmentModule from "./screens/AssignmentModule/AssignmentModule.tsx";
import ReportsAssignment from "./screens/Reports/ReportsAssignment.tsx";
import ReportsForm from "./screens/Reports/ReportsForm.tsx";

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
