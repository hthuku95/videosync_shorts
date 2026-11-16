import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Chip, CircularProgress, Alert,
} from '@mui/material';
import { Add as AddIcon , Upgrade as UpgradeIcon } from '@mui/icons-material';
import { campaignService, type Campaign } from '@/services/campaign.service';
import { getFeatureFlags } from '@/services/features.service';
import { CampaignComingSoon } from '@/components/marketing/CampaignComingSoon';
import { TierDialog } from '@/components/payments/TierDialog';
import { PATHS } from '@/routes/paths';

const SHORTS_TIERS = [
  { id: 'base', name: 'Starter', price: '$297/mo', accounts: 20, blurb: 'Included in your subscription.' },
  { id: 'agency50', name: 'Agency 50', price: '$499/mo', accounts: 50, blurb: 'For growing networks.' },
  { id: 'agency150', name: 'Agency 150', price: '$999/mo', accounts: 150, blurb: 'For large operations.' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tiersOpen, setTiersOpen] = useState(false);
  const [campaignsEnabled, setCampaignsEnabled] = useState(true);
  const [campaignsMessage, setCampaignsMessage] = useState<string | null>(null);

  useEffect(() => {
    getFeatureFlags().then((f) => {
      setCampaignsEnabled(f.campaigns_enabled);
      setCampaignsMessage(f.campaigns_message);
    });
    campaignService
      .list()
      .then(setCampaigns)
      .catch((e) => setError(e?.response?.data?.error || e.message || 'Failed to load campaigns'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {!campaignsEnabled && (
        <>
        <CampaignComingSoon message={campaignsMessage} />
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              How {appName} Campaigns Will Work
            </Typography>
            <Box component="ol" sx={{ pl: 3, mb: 2, '& li': { mb: 1.5 } }}>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Connect your social accounts</strong> — secure OAuth for each platform
                you want posted to. You stay in control and can disconnect anytime.
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Tell the AI what to make</strong> — your niche, style, and sources.
                {app === 'clips' || app === 'shorts'
                  ? ' For clip campaigns: the streams and videos you want turned into highlights.'
                  : app === 'app'
                  ? ' For website campaigns: your website URL — the AI learns your business from it.'
                  : app === 'learn'
                  ? ' For education campaigns: your lesson topics — grounded in authoritative sources.'
                  : ' Your topics, briefs, and sources.'}
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Every day, fresh videos</strong> — scripted, narrated, rendered with
                motion graphics, captioned and branded, then posted to your connected accounts
                automatically. Quality-checked before anything goes out.
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Track it all</strong> — the dashboard shows every generated video and
                every post, with analytics per account.
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Plans at launch:</strong> Starter includes 20 connected accounts with your
              subscription; Agency tiers (50 / 150 accounts) for larger operations. Exact pricing
              will be shown here when campaigns go live.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              <strong>Available today:</strong> the one-time video bundles — no subscription needed.
            </Typography>
          </CardContent>
        </Card>
        </>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          My Campaigns
        </Typography>
        {campaignsEnabled && (
        <Button variant="outlined" startIcon={<UpgradeIcon />} onClick={() => setTiersOpen(true)} sx={{ mr: 1 }}>
          Plan & Limits
        </Button>
        )}
        {campaignsEnabled && (
        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to={PATHS.CAMPAIGNS_NEW}>
          New Campaign
        </Button>
        )}      </Box>
      <TierDialog
        open={tiersOpen}
        onClose={() => setTiersOpen(false)}
        app="shorts"
        appName="VideoSync Shorts"
        tiers={SHORTS_TIERS}
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
            {campaignsEnabled ? (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create your first clip campaign — renders start within minutes.
                </Typography>
                <Button variant="contained" component={RouterLink} to={PATHS.CAMPAIGNS_NEW}>
                  Create Campaign
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" paragraph>
                {campaignsMessage || 'Monthly campaigns are coming soon. One-time bundles (10 videos for $50 or 30 for $100) are available in the meantime.'}
              </Typography>
            )}
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
                    {c.service_type === 'youtube_clipping' ? 'YouTube Clipping' : c.service_type}
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
