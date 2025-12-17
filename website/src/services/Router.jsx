import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Event from '../pages/Event.jsx';
import EventDetails from '../pages/EventDetails.jsx';
import Game from '../pages/Game.jsx';
import GameDetails from '../pages/GameDetails.jsx';
import Tag from '../pages/Tag.jsx';

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
    },
    {
        path: "/game",
        element: <Game />
    },
    {
        path: "/game/:id",
        element: <GameDetails />
    },
    {
        path: "/tag",
        element: <Tag />
    }
]);

export default router;