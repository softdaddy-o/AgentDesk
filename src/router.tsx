import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';
import TabWorkspacePage from './pages/TabWorkspacePage';
import TemplatesPage from './pages/TemplatesPage';
import HistoryPage from './pages/HistoryPage';
import MonitoringPage from './pages/MonitoringPage';
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
                path: 'workspace',
                element: <TabWorkspacePage />,
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
                path: 'monitoring',
                element: <MonitoringPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
        ],
    },
]);
