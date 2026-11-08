import { api } from '@/services/api';

export interface FeatureFlags {
  campaigns_enabled: boolean;
  campaigns_message: string | null;
}

let cached: { flags: FeatureFlags; at: number } | null = null;
const TTL_MS = 60_000;

/**
 * Public feature flags from the API (`GET /api/features`).
 *
 * Used to render the Coming-Soon state for gated products (owner directive
 * Nov 8 2026: the campaigns switch). The backend remains the source of truth —
 * campaign creation is 503'd server-side when the switch is OFF — this keeps
 * the UI honest and fast. On a network error we fail open so a blip can never
 * lock users out; the backend gate still protects the data.
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.flags;
  try {
    const res = await api.get('/api/features');
    const flags: FeatureFlags = {
      campaigns_enabled: !!res.data?.campaigns_enabled,
      campaigns_message: res.data?.campaigns_message ?? null,
    };
    cached = { flags, at: Date.now() };
    return flags;
  } catch {
    return { campaigns_enabled: true, campaigns_message: null };
  }
}
