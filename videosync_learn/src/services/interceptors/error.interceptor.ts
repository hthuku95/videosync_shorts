import { api } from '../api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: errorMessage,
    });

    const displayMessage =
      error.response?.status === 403
        ? 'You do not have permission to perform this action'
        : error.response?.status === 404
        ? 'The requested resource was not found'
        : error.response?.status === 500
        ? 'Server error. Please try again later.'
        : errorMessage;

    toast.error(displayMessage);

    return Promise.reject(error);
  }
);