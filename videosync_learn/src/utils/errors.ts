interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

/** Extract a human-readable message from an unknown thrown value (axios error, Error, string). */
export function getErrorMessage(err: unknown, fallback = 'Request failed'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'object') {
    const e = err as ApiErrorShape;
    return e.response?.data?.message || e.response?.data?.error || e.message || fallback;
  }
  return fallback;
}