import { RouterProvider } from 'react-router-dom';
import router from './services/Router.jsx';

function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default App;