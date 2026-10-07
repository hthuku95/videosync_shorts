import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Verifies a stored token on app load and initializes the auth state.
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const { token, isAuthenticated, setAuth, setLoading, clearAuth } = useAuthStore();

  const { data: verifyData, isError, isLoading: isVerifying } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: authService.verify,
    enabled: !!token && !isAuthenticated,
    retry: false,
    staleTime: Infinity,
  });

  /* eslint-disable react-hooks/set-state-in-effect -- verify-then-sync auth state once on load */
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (isAuthenticated) {
      setLoading(false);
      return;
    }
    if (verifyData?.success && verifyData.user) {
      setAuth(token, verifyData.user);
      setLoading(false);
    } else if (isError) {
      clearAuth();
    } else if (!isVerifying) {
      setLoading(false);
    }
  }, [token, isAuthenticated, verifyData, isError, isVerifying, setAuth, setLoading, clearAuth]);

  return <>{children}</>;
}