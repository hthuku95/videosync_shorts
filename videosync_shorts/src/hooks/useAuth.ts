import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { PATHS } from '@/routes/paths';
import toast from 'react-hot-toast';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  // Verify token on mount
  const { data: verifyData, isError, isFetching } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: () => authService.verify(),
    enabled: !!token && !isAuthenticated,
    retry: false,
    staleTime: Infinity,
  });

  // Update auth state when verification succeeds
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
    } else if (isError) {
      clearAuth();
    } else if (!isFetching) {
      setLoading(false);
    }
  }, [token, isAuthenticated, verifyData, isError, isFetching, setAuth, setLoading, clearAuth]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Welcome back!');
      navigate(PATHS.DASHBOARD);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Account created!');
      navigate(PATHS.DASHBOARD);
    },
  });

  const logout = () => {
    authService.logout();
    clearAuth();
    queryClient.clear();
    navigate(PATHS.LOGIN);
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginWithGoogle: authService.initiateGoogleOAuth,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}