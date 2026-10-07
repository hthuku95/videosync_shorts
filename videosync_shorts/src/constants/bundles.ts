import type { Bundle } from '@/types/websiteVideo.types';

// Static configuration for the Website-URL→Video service.
// These must match the offers registered in the Rust backend (PAYPAL_OFFERS
// in src/handlers/paypal.rs): website-video-10 ($50 / 10 credits) and
// website-video-30 ($100 / 30 credits).
export const BUNDLES: Bundle[] = [
  {
    id: 'website-video-10',
    name: 'Starter',
    credits: 10,
    priceUsd: '50.00',
    priceCents: 5000,
    description: '10 AI-generated videos from your website URL',
    features: [
      '10 videos generated from your site',
      'Landing page hero & product demos',
      '4K-ready animated output',
      'Download & reuse anywhere',
    ],
  },
  {
    id: 'website-video-30',
    name: 'Pro',
    credits: 30,
    priceUsd: '100.00',
    priceCents: 10000,
    description: 'Up to 30 AI-generated videos from your website URL',
    features: [
      'Up to 30 videos generated from your site',
      'Best value per video',
      'Landing page hero & product demos',
      'Priority rendering queue',
      'Download & reuse anywhere',
    ],
  },
];

export const DEFAULT_BUNDLE_ID = 'website-video-10';

export function findBundle(id: string): Bundle | undefined {
  return BUNDLES.find((b) => b.id === id);
}