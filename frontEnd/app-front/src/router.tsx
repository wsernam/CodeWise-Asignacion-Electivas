import Login from './screens/Login/Login.tsx'
import Electives from './screens/Electives/Electives.tsx'
import PreLogin from './screens/PreLogin/PreLogin.tsx';
import CreateProgram from './screens/Program/CreateProgram/CreateProgram.tsx';
import ListProgram from './screens/Program/ListProgram/ListProgram.tsx';
import UpdateProgramForm from './screens/Program/UpdateProgram/UpdateProgram.tsx';
import { createBrowserRouter } from 'react-router'
import LoginStudent from './screens/LoginStudent/LoginStudent.tsx';


const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login-student',
    element: <LoginStudent />,
  },
  {
    path: '/electives',
    element: <Electives />,
  },
  {
    path: '/',
    element: <PreLogin />,
  },
  {
    path: '/programs',
    element: <ListProgram />,
  },
  {
    path: '/program/createProgram',
    element: <CreateProgram />,
  },
  {
    path: '/program/edit/:codigo',
    element: <UpdateProgramForm />,
  }
]);

export default router;
