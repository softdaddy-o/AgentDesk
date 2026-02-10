import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';
import TemplatesPage from './pages/TemplatesPage';
import HistoryPage from './pages/HistoryPage';
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
                path: 'templates',
                element: <TemplatesPage />,
            },
            {
                path: 'history',
                element: <HistoryPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
        ],
    },
]);
