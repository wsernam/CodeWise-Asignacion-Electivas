import Login from './screens/Login/Login.tsx'
import Electives from './screens/Electives/Electives.tsx'
import { createBrowserRouter } from 'react-router'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/electives',
    element: <Electives />,
  }
]);

export default router;
