import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import SessionPage from './pages/SessionPage';
import TabWorkspacePage from './pages/TabWorkspacePage';
import TemplatesPage from './pages/TemplatesPage';
import HistoryPage from './pages/HistoryPage';
import MonitoringPage from './pages/MonitoringPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            {
                index: true,
                element: <TabWorkspacePage />,
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
                path: 'monitoring',
                element: <MonitoringPage />,
            },
        ],
    },
]);
