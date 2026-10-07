import { api } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerifyResponse,
} from '@/types/auth.types';
import { PATHS } from '@/routes/paths';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  async verify(): Promise<VerifyResponse> {
    const response = await api.get<VerifyResponse>('/api/auth/verify');
    return response.data;
  },

  initiateGoogleOAuth(redirectTo?: string): void {
    const url = new URL('/api/auth/google', api.defaults.baseURL);
    const callbackUrl = redirectTo || `${window.location.origin}${PATHS.OAUTH_CALLBACK}`;
    url.searchParams.set('redirect_to', callbackUrl);
    window.location.href = url.toString();
  },

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};