import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useUiStore } from '../../stores/uiStore';

export default function AppShell() {
    useKeyboard();
    const theme = useUiStore((s) => s.theme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

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
