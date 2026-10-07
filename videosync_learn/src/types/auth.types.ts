// Authentication related types

export interface User {
  id: string;
  email: string;
  username: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
  referred_by?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface VerifyResponse {
  success: boolean;
  user?: User;
  error?: string;
}