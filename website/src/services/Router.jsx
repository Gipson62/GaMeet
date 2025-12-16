import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App.jsx'; // On importe le cadre
import Login from '../pages/Login.jsx';
import Event from '../pages/Event.jsx';
// import UserProfile from '../pages/UserProfile';

const router = createBrowserRouter([
    {
        path: "/", // Redirection par défaut
        element: <Navigate to="/login" replace />
    },
    {
        path: "login",
        element: <Login />
    },
    {
        path: "/event", // Redirection par défaut
        element: <Event />
    },
]);

export default router;