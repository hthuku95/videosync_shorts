import type { Bundle } from '@/types/educationVideo.types';

// Static configuration for the Education Video (animated lesson) service.
// These must match the offers registered in the Rust backend (PAYPAL_OFFERS
// in src/handlers/paypal.rs): education-video-10 ($50 / 10 credits) and
// education-video-30 ($100 / 30 credits).
export const BUNDLES: Bundle[] = [
  {
    id: 'education-video-10',
    name: 'Lesson Starter',
    credits: 10,
    priceUsd: '50.00',
    priceCents: 5000,
    description: '10 animated lesson videos from your topic or course',
    features: [
      '10 lesson videos generated from your topic',
      'Animated explainers with diagrams',
      'Narration-ready educational output',
      'Download & reuse in any LMS',
    ],
  },
  {
    id: 'education-video-30',
    name: 'Lesson Pro',
    credits: 30,
    priceUsd: '100.00',
    priceCents: 10000,
    description: 'Up to 30 animated lesson videos from your topic or course',
    features: [
      'Up to 30 lesson videos generated',
      'Best value per lesson',
      'Animated explainers with diagrams',
      'Priority rendering queue',
      'Download & reuse in any LMS',
    ],
  },
];

export const DEFAULT_BUNDLE_ID = 'education-video-10';

export function findBundle(id: string): Bundle | undefined {
  return BUNDLES.find((b) => b.id === id);
}
