import Login from './screens/Login/Login.tsx'
import Electives from './screens/Electives/Electives.tsx'
import PreLogin from './screens/PreLogin/PreLogin.tsx';
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
  }
]);

export default router;
