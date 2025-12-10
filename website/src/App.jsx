import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './index.css';

function App() {
    return (
        <>
            {/* La Navbar est toujours visible */}
            <Navbar />

            <div className="app-content" style={{ padding: '20px' }}>
                {/* <Outlet /> est un emplacement vide rempli par le routeur */}
                <Outlet />
            </div>
        </>
    );
}

export default App;