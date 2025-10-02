// ---------------------- IMPORTS DE PANTALLAS ----------------------
import PreLogin from "./screens/PreLogin/PreLogin.tsx";
import LoginStudent from "./screens/LoginStudent/LoginStudent.tsx";
import LoginAdmin from "./screens/LoginAdmin/LoginAdmin.tsx";
import Dashboard from "./screens/Dashboard/Dashboard.tsx";
import Electives from "./screens/Electives/ListElective.tsx";
import AddElective from "./screens/Electives/AddElective";
import EditElective from "./screens/Electives/EditElective.tsx";

import CreateProgram from "./screens/Program/CreateProgram.tsx";
import ListProgram from "./screens/Program/ListProgram.tsx";
import EditProgram from "./screens/Program/EditProgram.tsx";

import ManageForm from "./screens/Form/manageForm/ManageForm.tsx";

// ---------------------- IMPORTS DE ROUTER ----------------------
import { createBrowserRouter } from "react-router";

// ---------------------- CONFIGURACIÓN DEL ROUTER ----------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: <PreLogin />,
  },
  {
    path: "/login-admin",
    element: <LoginAdmin />,
  },
  {
    path: "/login-student",
    element: <LoginStudent />,
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
    path: "/electives/edit/:codigo",
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
    path:"/form/manage",
    element: <ManageForm />
  }
]);

export default router;
