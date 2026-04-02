import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components';
import { AdDetailsPage, AdEditPage, AdsListPage } from '@/pages';

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/ads" replace /> },
      { path: 'ads', element: <AdsListPage /> },
      { path: 'ads/:id', element: <AdDetailsPage /> },
      { path: 'ads/:id/edit', element: <AdEditPage /> },
      { path: '*', element: <Navigate to="/ads" replace /> },
    ],
  },
]);
