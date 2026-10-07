import { useState } from 'react';
import { Box, Typography, Card, Grid, Button, Chip } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useCredits } from '@/hooks/useCredits';
import { BUNDLES } from '@/constants/bundles';
import type { Bundle } from '@/types/websiteVideo.types';
import { PaymentModal } from '@/components/payments/PaymentModal';

export function BundlesPage() {
  const navigate = useNavigate();
  const { remaining } = useCredits();
  const [selected, setSelected] = useState<Bundle | null>(null);

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Pricing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          One-time bundles. No subscription. Your videos never expire.
          {remaining > 0 && ` You currently have ${remaining} videos remaining.`}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {BUNDLES.map((b) => (
          <Grid size={{ xs: 12, md: 6 }} key={b.id}>
            <Card
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                border: (t) =>
                  b.id === 'website-video-30' ? `2px solid ${t.palette.primary.main}` : 'none',
              }}
            >
              {b.id === 'website-video-30' && (
                <Chip
                  label="Best value"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: -12, right: 24 }}
                />
              )}

              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {b.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {b.description}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box component="span" sx={{ fontSize: '3rem', fontWeight: 800 }}>
                  ${b.priceUsd}
                </Box>
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {' '}/ {b.credits} videos
                </Box>
              </Box>

              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', mb: 3, flex: 1 }}>
                {b.features.map((f) => (
                  <Box component="li" key={f} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <CheckIcon color="success" fontSize="small" />
                    <Typography variant="body2">{f}</Typography>
                  </Box>
                ))}
              </Box>

              <Button
                variant={b.id === 'website-video-30' ? 'contained' : 'outlined'}
                size="large"
                fullWidth
                onClick={() => setSelected(b)}
              >
                Buy {b.name}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          Already purchased? View your videos on the dashboard.
        </Typography>
        <Button variant="text" onClick={() => navigate(PATHS.DASHBOARD)}>
          Go to Dashboard
        </Button>
      </Box>

      {selected && (
        <PaymentModal open onClose={() => setSelected(null)} bundle={selected} />
      )}
    </Box>
  );
}