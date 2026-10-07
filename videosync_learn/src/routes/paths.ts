// Route path constants — VideoSync Clips

export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  OAUTH_CALLBACK: '/auth/callback',

  DASHBOARD: '/dashboard',
  CAMPAIGNS_NEW: '/campaigns/new',
  CAMPAIGN_DETAIL: '/campaigns/:id',
  SETTINGS: '/settings',

  NOT_FOUND: '/404',
} as const;
