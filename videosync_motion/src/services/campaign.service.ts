import { api } from '@/services/api';

export const CLIPS_APP = 'motion';
export const CLIPS_PRICE_CENTS = 14900;

export interface Campaign {
  id: string;
  name: string;
  service_type: string;
  brief: string;
  style: string | null;
  duration: number;
  schedule: Array<{ time: string; platform: string }>;
  platforms: Array<{ platform: string; account_id: string }>;
  posts_per_day: number;
  start_date: string;
  end_date: string;
  zernio_profile_id: string | null;
  source_url: string | null;
  status: string;
  total_posts_planned: number;
  total_posts_published: number;
  paid_until: string | null;
  created_at: string;
}

export interface CampaignPost {
  id: string;
  day_number: number;
  slot_index: number;
  scheduled_at: string;
  variation_prompt: string | null;
  caption: string | null;
  media_r2_url: string | null;
  status: string;
  zernio_post_id: string | null;
}

export interface CreateCampaignRequest {
  name: string;
  service_type: string;
  brief: string;
  style?: string | null;
  duration?: number | null;
  schedule: Array<{ time: string; platform: string }>;
  platforms: Array<{ platform: string; account_id: string }>;
  posts_per_day?: number | null;
  start_date: string;
  end_date: string;
  zernio_profile_id?: string | null;
  source_url?: string | null;
}

/** All campaign calls carry X-App so the backend prices + scopes by app. */
const appHeaders = { 'X-App': CLIPS_APP };

export const campaignService = {
  async list(): Promise<Campaign[]> {
    const resp = await api.get<{ success: boolean; campaigns: Campaign[] }>('/api/campaigns', {
      headers: appHeaders,
    });
    return resp.data.campaigns || [];
  },

  async get(id: string): Promise<{ campaign: Campaign; posts: CampaignPost[] }> {
    const resp = await api.get<{ success: boolean; campaign: Campaign; posts: CampaignPost[] }>(
      `/api/campaigns/${id}`,
      { headers: appHeaders },
    );
    return { campaign: resp.data.campaign, posts: resp.data.posts || [] };
  },

  async create(req: CreateCampaignRequest): Promise<{ success: boolean; id?: string; status?: string; error?: string }> {
    const resp = await api.post('/api/campaigns', req, { headers: appHeaders });
    return resp.data;
  },

  async getPosts(id: string): Promise<CampaignPost[]> {
    const resp = await api.get<{ success: boolean; posts: CampaignPost[] }>(`/api/campaigns/${id}/posts`, {
      headers: appHeaders,
    });
    return resp.data.posts || [];
  },

  async paySpec(id: string): Promise<{ price_cents?: number; description?: string; already_active?: boolean; error?: string } & Record<string, unknown>> {
    const resp = await api.get(`/api/campaigns/${id}/pay-spec`, { headers: appHeaders });
    return resp.data;
  },

  async paypalActivate(id: string, orderId: string): Promise<{ success: boolean; status?: string; error?: string }> {
    const resp = await api.post(
      `/api/campaigns/${id}/paypal-activate`,
      { order_id: orderId },
      { headers: appHeaders },
    );
    return resp.data;
  },

  async pause(id: string): Promise<void> {
    await api.post(`/api/campaigns/${id}/pause`, {}, { headers: appHeaders });
  },

  async resume(id: string): Promise<void> {
    await api.post(`/api/campaigns/${id}/resume`, {}, { headers: appHeaders });
  },

  async cancel(id: string): Promise<void> {
    await api.post(`/api/campaigns/${id}/cancel`, {}, { headers: appHeaders });
  },
};
