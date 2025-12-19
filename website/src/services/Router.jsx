import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Event from '../pages/Event.jsx';
import EventDetails from '../pages/EventDetails.jsx';
import Game from '../pages/Game.jsx';
import GameDetails from '../pages/GameDetails.jsx';
import Tag from '../pages/Tag.jsx';
import UserDetails from '../pages/UserDetails.jsx';
import User from "../pages/Users.jsx";
import MainPage from "../pages/MainPage.jsx";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/event/:id",
        element: <EventDetails />
    },
    {
        path: "/game/:id",
        element: <GameDetails />
    },
    {
        path: "/profile",
        element: <UserDetails />
    },
    {
        path: "/user/:id",
        element: <UserDetails />
    },
    {
        path: '/',
        element: <MainPage />,
        children: [
            { path: 'users', element: <User /> },
            { path: 'games', element: <Game /> },
            { path: 'events', element: <Event /> },
            { path: 'tags', element: <Tag /> },
        ],
    }
]);

export default router;