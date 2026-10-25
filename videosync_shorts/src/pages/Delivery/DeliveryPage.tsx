import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';

/**
 * Branded delivery viewer for this app's domain. The actual render + stream
 * live on the core API (videosync.ink/delivery/:id); we surface them here so
 * prospects never see a raw storage URL or a foreign domain.
 */
export default function DeliveryPage() {
  const { id } = useParams();
  return (
    <Box sx={{ width: '100%', height: '100vh', m: 0, p: 0, overflow: 'hidden' }}>
      <iframe
        src={`https://videosync.ink/delivery/${id}`}
        title="Delivery"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="autoplay; fullscreen"
      />
    </Box>
  );
}
