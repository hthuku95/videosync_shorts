import axios from 'axios';
import { config } from '@/config/config';

// Create axios instance
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Response interceptor added by auth.interceptor.ts and error.interceptor.ts

export default api;