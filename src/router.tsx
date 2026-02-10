import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';
import SettingsPage from './pages/SettingsPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: 'session/:sessionId',
                element: <SessionPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
        ],
    },
]);
