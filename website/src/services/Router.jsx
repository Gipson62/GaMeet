import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Event from '../pages/Event.jsx';
import EventDetails from '../pages/EventDetails.jsx';
const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />
    },
    {
        path: "login",
        element: <Login />
    },
    {
        path: "/event",
        element: <Event />
    },
    {
        path: "/event/:id",
        element: <EventDetails />
    }
]);

export default router;