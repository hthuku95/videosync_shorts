import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PATHS } from './paths';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { HomePage } from '@/pages/Home/HomePage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { OAuthCallbackPage } from '@/pages/Auth/OAuthCallbackPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { GeneratePage } from '@/pages/Generate/GeneratePage';
import { VideosPage } from '@/pages/Videos/VideosPage';
import { BundlesPage } from '@/pages/Bundles/BundlesPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

export const router = createBrowserRouter([
  // Public landing / marketing page
  {
    path: PATHS.HOME,
    element: <HomePage />,
  },

  // Auth routes (no sidebar/topbar)
  {
    element: <AuthLayout />,
    children: [
      { path: PATHS.LOGIN, element: <LoginPage /> },
      { path: PATHS.REGISTER, element: <RegisterPage /> },
      { path: PATHS.OAUTH_CALLBACK, element: <OAuthCallbackPage /> },
    ],
  },

  // App routes (with sidebar/topbar) - Protected
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: PATHS.DASHBOARD,
        element: (
          <ErrorBoundary>
            <DashboardPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.GENERATE,
        element: (
          <ErrorBoundary>
            <GeneratePage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.VIDEOS,
        element: (
          <ErrorBoundary>
            <VideosPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.BUNDLES,
        element: (
          <ErrorBoundary>
            <BundlesPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.SETTINGS,
        element: (
          <ErrorBoundary>
            <SettingsPage />
          </ErrorBoundary>
        ),
      },
    ],
  },

  // 404 page (no layout)
  {
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to={PATHS.NOT_FOUND} replace />,
  },
]);