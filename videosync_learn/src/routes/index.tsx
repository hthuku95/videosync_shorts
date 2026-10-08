import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PATHS } from './paths';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { TermsPage, PrivacyPage, RefundPage, ContactPage } from '@/pages/Legal/LegalPages';
import { HomePage } from '@/pages/Home/HomePage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { OAuthCallbackPage } from '@/pages/Auth/OAuthCallbackPage';
import CampaignsPage from '@/pages/Campaigns/CampaignsPage';
import NewCampaignPage from '@/pages/Campaigns/NewCampaignPage';
import CampaignDetailPage from '@/pages/Campaigns/CampaignDetailPage';
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
            <CampaignsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.CAMPAIGNS_NEW,
        element: (
          <ErrorBoundary>
            <NewCampaignPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.CAMPAIGN_DETAIL,
        element: (
          <ErrorBoundary>
            <CampaignDetailPage />
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

  // Legal pages (public, no layout)
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/refund',
    element: <RefundPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
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