import { api } from './api';
import type {
  CreditsSummary,
  Delivery,
  GenerateVideoRequest,
  PayPalCreateResponse,
  PayPalCaptureResponse,
  PaymentRequiredResponse,
  SettleResponse,
  GenerateResponse,
  VideosResponse,
} from '@/types/educationVideo.types';

/**
 * Client for the Education Video (animated lesson) service.
 *
 * Backend endpoints (auth'd, src/handlers/education_video.rs + a route merge
 * in src/main.rs):
 *   GET  /api/education-video/credits            → credits ledger
 *   GET  /api/education-video/pay-spec?offer_id= → x402 PaymentRequiredResponse
 *   POST /api/education-video/settle             → settle USDC payment (X-Payment header)
 *   POST /api/education-video/payment/paypal/create  → create PayPal order + pending bundle
 *   POST /api/education-video/payment/paypal/capture → capture PayPal order, grant credits
 *   POST /api/education-video/generate           → create education delivery (decrement credit)
 *   GET  /api/education-video/videos             → list the user's lesson deliveries
 *
 * The existing GET /api/paypal/config returns { client_id, offers } for the JS SDK.
 */
export const educationVideoService = {
  getPayPalConfig: async (): Promise<{ client_id: string }> => {
    const { data } = await api.get<{ client_id: string }>('/api/paypal/config');
    return data;
  },

  getCredits: async (): Promise<CreditsSummary> => {
    const { data } = await api.get<{ success: boolean; error?: string } & Partial<CreditsSummary>>(
      '/api/education-video/credits'
    );
    if (!data.success) throw new Error(data.error || 'Failed to load credits');
    return {
      purchased: data.purchased ?? 0,
      used: data.used ?? 0,
      remaining: data.remaining ?? 0,
    };
  },

  createPayPalOrder: async (offerId: string): Promise<PayPalCreateResponse> => {
    const { data } = await api.post<PayPalCreateResponse>('/api/education-video/payment/paypal/create', {
      offer_id: offerId,
    });
    return data;
  },

  capturePayPalOrder: async (bundleId: string): Promise<PayPalCaptureResponse> => {
    const { data } = await api.post<PayPalCaptureResponse>('/api/education-video/payment/paypal/capture', {
      bundle_id: bundleId,
    });
    return data;
  },

  getPaySpec: async (offerId: string): Promise<PaymentRequiredResponse> => {
    const { data } = await api.get<PaymentRequiredResponse>('/api/education-video/pay-spec', {
      params: { offer_id: offerId },
    });
    return data;
  },

  settle: async (offerId: string, xPayment: string): Promise<SettleResponse> => {
    const { data } = await api.post<SettleResponse>(
      '/api/education-video/settle',
      { offer_id: offerId },
      { headers: { 'X-Payment': xPayment } }
    );
    return data;
  },

  generateVideo: async (req: GenerateVideoRequest): Promise<GenerateResponse> => {
    const { data } = await api.post<GenerateResponse>('/api/education-video/generate', req);
    return data;
  },

  listVideos: async (): Promise<Delivery[]> => {
    const { data } = await api.get<VideosResponse>('/api/education-video/videos');
    if (!data.success) throw new Error(data.error || 'Failed to list videos');
    return data.deliveries || [];
  },
};