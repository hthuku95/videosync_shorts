import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { PATHS } from '@/routes/paths';

/**
 * Handles the OAuth redirect back from the backend. The backend appends
 * ?token=<jwt> to the redirect_to URL on success. We verify the token to
 * obtain the full user object, then store auth and redirect to the dashboard.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate(PATHS.LOGIN, { replace: true });
      return;
    }

    (async () => {
      try {
        localStorage.setItem('auth_token', token);
        const res = await authService.verify();
        if (res.success && res.user) {
          setAuth(token, res.user);
          navigate(PATHS.DASHBOARD, { replace: true });
        } else {
          navigate(PATHS.LOGIN, { replace: true });
        }
      } catch {
        navigate(PATHS.LOGIN, { replace: true });
      }
    })();
  }, [searchParams, setAuth, navigate]);

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Completing sign in...
      </Typography>
    </Box>
  );
}