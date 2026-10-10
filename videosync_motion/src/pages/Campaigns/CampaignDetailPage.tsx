import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Chip, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, LinearProgress,
  Tabs, Tab,
} from '@mui/material';
import { campaignService, type Campaign, type CampaignPost } from '@/services/campaign.service';
import { UsdcPayDialog } from '@/components/payments/UsdcPayDialog';
import { usePayPalScript } from '@/hooks/usePayPalScript';
import { PATHS } from '@/routes/paths';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processMsg, setProcessMsg] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const { campaign: c, posts: p } = await campaignService.get(id);
      setCampaign(c);
      setPosts(p);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !campaign) {
    return (
      <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
        <Alert severity="error">{error || 'Campaign not found'}</Alert>
        <Button component={RouterLink} to={PATHS.DASHBOARD} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  const needsPayment = campaign.status === 'pending_payment';

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            {campaign.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {campaign.service_type.replaceAll('_', ' ')}
            {' · '}
            {campaign.total_posts_published}/{campaign.total_posts_planned} posted
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          disabled={processing}
          onClick={async () => {
            setProcessing(true);
            setProcessMsg('');
            try {
              const res = await campaignService.processNow(campaign.id);
              const ok = (res.posts || []).filter((x: any) => !x.error).length;
              setProcessMsg(res.success ? `Render started for ${ok} post(s) — watch statuses below.` : (res.error || 'Failed to start'));
              load();
            } catch (e: any) {
              setProcessMsg(e?.response?.data?.error || e.message || 'Failed to start');
            } finally {
              setProcessing(false);
            }
          }}
        >
          {processing ? 'Starting…' : 'Process Now'}
        </Button>
        <Chip
          label={campaign.status}
          color={campaign.status === 'active' ? 'success' : campaign.status === 'pending_payment' ? 'warning' : 'default'}
        />
      </Box>

      {processMsg && (
        <Alert severity={processMsg.startsWith('Render started') ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setProcessMsg('')}>
          {processMsg}
        </Alert>
      )}
      {needsPayment && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" variant="contained" onClick={() => setPayOpen(true)}>
              Pay $149/mo
            </Button>
          }
        >
          This campaign is waiting for payment. Activate to start daily renders.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Posts
          </Typography>
          {posts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No posts yet — the first renders appear here once the campaign is active.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {posts.slice(0, 20).map((p) => (
                <Box key={p.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      Day {p.day_number} · {p.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {p.caption || p.variation_prompt || '—'}
                    </Typography>
                    {p.status === 'rendering' || p.status === 'pending_generation' ? (
                      <LinearProgress sx={{ mt: 1 }} />
                    ) : null}
                  </Box>
                  {(() => { const vurl = p.media_url || p.media_r2_url; return vurl ? (
                    <Button size="small" variant="outlined" href={vurl} target="_blank">
                      View
                    </Button>
                  ) : null; })()}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <PayDialog open={payOpen} onClose={() => setPayOpen(false)} campaignId={campaign.id} onPaid={load} />
    </Box>
  );
}

function PayDialog({
  open,
  onClose,
  campaignId,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  onPaid: () => void;
}) {
  const { loaded, error: sdkError } = usePayPalScript();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<0 | 1>(0);
  const [amountUsd, setAmountUsd] = useState('$199.00');

  useEffect(() => {
    if (!open) return;
    setTab(0);
    setError('');
    // Pull the authoritative price for the USDC tab.
    campaignService
      .paySpec(campaignId)
      .then((spec: any) => {
        const cents =
          spec?.accepts?.[0]?.max_amount_required != null
            ? Number(spec.accepts[0].max_amount_required) / 1e4
            : 19900;
        setAmountUsd(`$${(cents / 100).toFixed(2)}`);
      })
      .catch(() => {});
  }, [open, campaignId]);

  useEffect(() => {
    if (!open || tab !== 0 || !loaded || !window.paypal?.Buttons || !paypalRef.current) return;
    paypalRef.current.innerHTML = '';
    window.paypal
      .Buttons({
        style: { layout: 'vertical', shape: 'rect' },
        createOrder: async () => {
          setError('');
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/campaigns/${campaignId}/paypal-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              'X-App': 'motion',
            },
          }).then((r) => r.json());
          if (!res.success || !res.paypal_order_id) throw new Error(res.error || 'Failed to create order');
          return res.paypal_order_id;
        },
        onApprove: async (data: any, actions: any) => {
          setBusy(true);
          try {
            await actions.order.capture();
            const res = await campaignService.paypalActivate(campaignId, data.orderID);
            if (!res.success) throw new Error(res.error || 'Activation failed');
            onPaid();
            onClose();
          } catch (e: any) {
            setError(e.message || 'Payment failed');
          } finally {
            setBusy(false);
          }
        },
      })
      .render(paypalRef.current);
  }, [open, tab, loaded, campaignId, onPaid, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Activate — VideoSync Motion $149/mo</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Daily Kick + Twitch clip campaigns, up to 3 posts a day. Cancel anytime.
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v: 0 | 1) => {
            setTab(v);
            setError('');
          }}
          sx={{ mb: 2 }}
        >
          <Tab label="PayPal / Card" />
          <Tab label="USDC (Base)" />
        </Tabs>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {tab === 0 ? (
          sdkError ? (
            <Alert severity="warning">{sdkError}</Alert>
          ) : busy ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box ref={paypalRef} sx={{ minHeight: 90 }} />
          )
        ) : (
          <UsdcPayDialog campaignId={campaignId} amountUsd={amountUsd} onPaid={() => { onPaid(); onClose(); }} />
        )}
      </DialogContent>
    </Dialog>
  );
}
