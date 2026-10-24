import { api } from '@/services/api';
import { CLIPS_APP } from '@/services/campaign.service';

/** Customer-safe production activity returned by the campaign activity API. */
export interface ActivityEvent {
  type: string;
  label: string;
  at: string;
  note?: string;
}

export interface ActivityItem {
  post_id: string;
  day_number: number;
  slot_index: number;
  post_status: string;
  delivery_id: string | null;
  workflow_id: string | null;
  workflow_status: string;
  current_step: string;
  current_step_label: string;
  stage_index: number;
  stage_count: number;
  stage_label: string;
  active: boolean;
  can_feedback: boolean;
  elapsed_seconds: number;
  last_heartbeat_at: string | null;
  events: ActivityEvent[];
}

export interface CampaignActivity {
  success: boolean;
  campaign_id: string;
  service_type: string;
  generated_at: string;
  summary: { total: number; active: number; completed: number; failed: number };
  items: ActivityItem[];
}

export interface FeedbackResponse {
  success: boolean;
  saved?: boolean;
  delivered?: boolean;
  message?: string;
  error?: string;
}

const appHeaders = { 'X-App': CLIPS_APP };

export const activityService = {
  async get(campaignId: string): Promise<CampaignActivity> {
    const resp = await api.get<CampaignActivity>(`/api/campaigns/${campaignId}/activity`, {
      headers: appHeaders,
    });
    return resp.data;
  },

  async sendFeedback(workflowId: string, message: string): Promise<FeedbackResponse> {
    const resp = await api.post<FeedbackResponse>(
      `/api/workflows/${workflowId}/feedback`,
      { message },
    );
    return resp.data;
  },
};
