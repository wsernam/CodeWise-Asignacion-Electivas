// ---------------------- IMPORTS DE PANTALLAS ----------------------
import PreLogin from "./screens/PreLogin/PreLogin.tsx";
import LoginStudent from "./screens/LoginStudent/LoginStudent.tsx";
import Login from "./screens/Login/Login.tsx";
import Electives from "./screens/Electives/Electives.tsx";
import AddElective from "./screens/Electives/AddElective";
import EditElective from "./screens/Electives/EditElective.tsx";

import CreateProgram from "./screens/Program/CreateProgram/CreateProgram.tsx";
import ListProgram from "./screens/Program/ListProgram/ListProgram.tsx";
import UpdateProgramForm from "./screens/Program/UpdateProgram/UpdateProgram.tsx";

import ManageForm from "./screens/Form/activateForm/ManageForm.tsx";

// ---------------------- IMPORTS DE ROUTER ----------------------
import { createBrowserRouter } from "react-router";

// ---------------------- CONFIGURACIÓN DEL ROUTER ----------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: <PreLogin />,
  },
  {
    path: "/login",
    element: <Login />,
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
    path: "/program/createProgram",
    element: <CreateProgram />,
  },
  {
    path: "/program/edit/:codigo",
    element: <UpdateProgramForm />,
  },
  {
    path:"/form/manage",
    element: <ManageForm />
  }
]);

export default router;
