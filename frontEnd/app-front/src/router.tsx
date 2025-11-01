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

// ---------------------- CONFIGURACIÓN DEL ROUTER ----------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: <PreLogin />,
  },
  // Estudiante
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

  // Administrador
  {
    path: "/login-admin",
    element: <LoginAdmin />,
  },
  {
    path: "/electives",
    element: <Electives />,
  },
  {
    path: "/electives/add",
    element: <AddElective />,
  },
  {
    path: "/electives/edit/:ele_codigo",
    element: <EditElective />,
  },
  {
    path: "/programs",
    element: <ListProgram />,
  },
  {
    path: "/programs/create",
    element: <CreateProgram />,
  },
  {
    path: "/programs/edit/:codigo",
    element: <EditProgram />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/offer",
    element: <Offer />,
  },

  // Asignador
  {
    path: "/assignment-module",
    element: <AssignmentModule />,
  },
  {
    path: "/reports-assignment",
    element: <ReportsAssignment />,
  },
  {
    path: "/reports-form",
    element: <ReportsForm />,
  },
]);

export default router;
