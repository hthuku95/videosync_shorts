import { useQuery, useQueryClient } from '@tanstack/react-query';
import { websiteVideoService } from '@/services/websiteVideo.service';
import type { CreditsSummary } from '@/types/websiteVideo.types';

export const CREDITS_QUERY_KEY = ['websiteVideo', 'credits'];

/**
 * Loads the user's credits ledger and exposes helpers to refresh it
 * (e.g. after a purchase or generation).
 */
export function useCredits() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: CREDITS_QUERY_KEY,
    queryFn: () => websiteVideoService.getCredits(),
  });

  const summary: CreditsSummary = data ?? { purchased: 0, used: 0, remaining: 0 };

  return {
    ...summary,
    isLoading,
    isError,
    refetch,
    refresh: refetch,
  };
}

export function useRefreshCredits() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CREDITS_QUERY_KEY });
}