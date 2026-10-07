import { Chip } from '@mui/material';
import type { DeliveryStatus } from '@/types/websiteVideo.types';

const STATE_COLOR: Record<DeliveryStatus, 'success' | 'info' | 'warning' | 'error'> = {
  completed: 'success',
  running: 'info',
  pending: 'warning',
  failed: 'error',
};

const STATE_LABEL: Record<DeliveryStatus, string> = {
  completed: 'Completed',
  running: 'Rendering',
  pending: 'Queued',
  failed: 'Failed',
};

export function VideoStatusChip({ status }: { status: DeliveryStatus }) {
  return <Chip size="small" color={STATE_COLOR[status]} label={STATE_LABEL[status]} />;
}