import { Box, Card, Typography, Chip } from '@mui/material';

/**
 * Coming-soon panel for gated campaign features — styled to match the app's
 * glassmorphism featured-card language (owner directive Nov 8 2026):
 * gradient + blur + 1px primary border, same typography tokens as PricingTiers.
 */
export function CampaignComingSoon({
  message,
  title,
}: {
  message?: string | null;
  title?: string;
}) {
  return (
    <Card
      sx={{
        p: { xs: 2, md: 2.5 },
        background:
          'linear-gradient(160deg, rgba(99,102,241,0.22), rgba(56,189,248,0.10))',
        backdropFilter: 'blur(12px)',
        border: '1px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>
            📅 {title || 'Monthly campaigns — coming soon'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {message ||
              'Monthly campaigns are coming soon. In the meantime, one-time bundles (10 videos for $50 or 30 for $100) are available.'}
          </Typography>
        </Box>
        <Chip label="Coming soon" color="warning" size="small" />
      </Box>
    </Card>
  );
}
