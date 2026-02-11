import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
        <div className="app-shell app-shell-no-sidebar">
            <main className="main-content main-content-full">
                <ErrorBoundary name="page">
                    <Outlet />
                </ErrorBoundary>
            </main>
            <StatusBar />
            <ToastContainer />
        </div>
    );
}
