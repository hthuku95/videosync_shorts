import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { websiteVideoService } from '@/services/websiteVideo.service';

interface UsePayPalScriptResult {
  loaded: boolean;
  error: string | null;
}

/**
 * Loads the PayPal JS SDK once, using the client_id from the backend
 * (/api/paypal/config). Returns whether the SDK is loaded.
 */
export function usePayPalScript(): UsePayPalScriptResult {
  const { data } = useQuery({
    queryKey: ['paypal', 'config'],
    queryFn: () => websiteVideoService.getPayPalConfig(),
    staleTime: Infinity,
    retry: false,
  });

  const clientId = data?.client_id;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect -- external SDK script lifecycle */
  useEffect(() => {
    if (!clientId) return;
    if (startedRef.current) return;
    startedRef.current = true;

    if (window.paypal?.Buttons) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&intent=capture&currency=USD`;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError('Failed to load PayPal SDK');
    document.body.appendChild(script);
  }, [clientId]);

  return { loaded, error };
}