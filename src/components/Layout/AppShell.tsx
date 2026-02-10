import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import { useKeyboard } from '../../hooks/useKeyboard';

export default function AppShell() {
    useKeyboard();

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            <StatusBar />
        </div>
    );
}
