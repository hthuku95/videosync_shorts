// Types for the Website-URL→Video service

export interface Bundle {
  id: string;
  name: string;
  credits: number;
  priceUsd: string;
  priceCents: number;
  description: string;
  features: string[];
}

export interface CreditsSummary {
  purchased: number;
  used: number;
  remaining: number;
}

export interface GenerateVideoRequest {
  source_url: string;
  product_name?: string;
  brief?: string;
  style?: string;
  duration?: number;
}

export type DeliveryStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Delivery {
  id: string;
  title: string;
  status: DeliveryStatus;
  output_r2_url?: string | null;
  preview_r2_url?: string | null;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface PayPalCreateResponse {
  success: boolean;
  bundle_id?: string;
  paypal_order_id?: string;
  error?: string;
}

export interface PayPalCaptureResponse {
  success: boolean;
  credits_purchased?: number;
  credits_remaining?: number;
  error?: string;
}

export interface PaymentRequiredResponse {
  resource_url: string;
  verification_url: string;
  method: string;
  price: string;
  currency: string;
  expires_at?: string;
  error?: string;
}

export interface SettleResponse {
  success: boolean;
  tx_hash?: string;
  credits_purchased?: number;
  credits_remaining?: number;
  error?: string;
}

export interface GenerateResponse {
  success: boolean;
  delivery_id?: string;
  credits_remaining?: number;
  error?: string;
}

export interface VideosResponse {
  success: boolean;
  deliveries?: Delivery[];
  error?: string;
}