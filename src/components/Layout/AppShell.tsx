import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import ErrorBoundary from '../ErrorBoundary';
import ToastContainer from '../Toast/ToastContainer';
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
            <ErrorBoundary name="sidebar">
                <Sidebar />
            </ErrorBoundary>
            <main className="main-content">
                <ErrorBoundary name="page">
                    <Outlet />
                </ErrorBoundary>
            </main>
            <StatusBar />
            <ToastContainer />
        </div>
    );
}
