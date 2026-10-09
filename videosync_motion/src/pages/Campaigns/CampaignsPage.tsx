import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Chip, CircularProgress, Alert,
} from '@mui/material';
import { Add as AddIcon , Upgrade as UpgradeIcon } from '@mui/icons-material';
import { campaignService, type Campaign } from '@/services/campaign.service';
import { TierDialog } from '@/components/payments/TierDialog';
import { PATHS } from '@/routes/paths';

const MOTION_TIERS = [
  { id: 'base', name: 'Starter', price: '$149/mo', accounts: 20, blurb: 'Included in your subscription.' },
  { id: 'agency50', name: 'Agency 50', price: '$499/mo', accounts: 50, blurb: 'For studios.' },
  { id: 'agency150', name: 'Agency 150', price: '$999/mo', accounts: 150, blurb: 'For large operations.' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tiersOpen, setTiersOpen] = useState(false);

  useEffect(() => {
    campaignService
      .list()
      .then(setCampaigns)
      .catch((e) => setError(e?.response?.data?.error || e.message || 'Failed to load campaigns'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          My Campaigns
        </Typography>
        <Button variant="outlined" startIcon={<UpgradeIcon />} onClick={() => setTiersOpen(true)} sx={{ mr: 1 }}>
          Plan & Limits
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to={PATHS.CAMPAIGNS_NEW}>
          New Campaign
        </Button>
      </Box>
      <TierDialog
        open={tiersOpen}
        onClose={() => setTiersOpen(false)}
        app="motion"
        appName="VideoSync Motion"
        tiers={MOTION_TIERS}
        onChanged={() => {}}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>No campaigns yet</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first clip campaign — renders start within minutes.
            </Typography>
            <Button variant="contained" component={RouterLink} to={PATHS.CAMPAIGNS_NEW}>
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {campaigns.map((c) => (
            <Card key={c.id} component={RouterLink} to={`/campaigns/${c.id}`} sx={{ textDecoration: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="h6">{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.service_type.replaceAll('_', ' ')}
                    {' · '}
                    {c.total_posts_published}/{c.total_posts_planned} posted
                  </Typography>
                </Box>
                <Chip
                  label={c.status}
                  size="small"
                  color={c.status === 'active' ? 'success' : c.status === 'pending_payment' ? 'warning' : 'default'}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
