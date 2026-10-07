import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import toast from 'react-hot-toast';
import type { Bundle } from '@/types/websiteVideo.types';
import { websiteVideoService } from '@/services/websiteVideo.service';
import { usePayPalScript } from '@/hooks/usePayPalScript';
import { useRefreshCredits } from '@/hooks/useCredits';
import { getErrorMessage } from '@/utils/errors';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  bundle: Bundle;
}

export function PaymentModal({ open, onClose, bundle }: PaymentModalProps) {
  const [tab, setTab] = useState<0 | 1>(0);
  const [busy, setBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState('');
  const [error, setError] = useState('');
  const refreshCredits = useRefreshCredits();
  const { loaded, error: sdkError } = usePayPalScript();
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // Render PayPal buttons once the SDK and container are ready
  useEffect(() => {
    if (!open) return;
    if (!loaded) return;
    if (!window.paypal?.Buttons) return;
    if (!paypalContainerRef.current) return;

    setBusyMessage('Ready to pay');

    window.paypal
      .Buttons({
        style: { layout: 'vertical', shape: 'rect' },
        createOrder: async () => {
          setError('');
          try {
            const res = await websiteVideoService.createPayPalOrder(bundle.id);
            if (!res.success || !res.paypal_order_id) {
              throw new Error(res.error || 'Failed to create order');
            }
            // stash bundle id for the capture step
            window.sessionStorage.setItem('website_video_bundle_id', res.bundle_id || '');
            return res.paypal_order_id;
          } catch (err) {
            setError(getErrorMessage(err, 'Failed to create PayPal order'));
            throw err;
          }
        },
        onApprove: async () => {
          setBusy(true);
          setBusyMessage('Completing payment...');
          try {
            const bundleId =
              window.sessionStorage.getItem('website_video_bundle_id') || '';
            if (!bundleId) throw new Error('Missing bundle reference');
            const res = await websiteVideoService.capturePayPalOrder(bundleId);
            if (!res.success) throw new Error(res.error || 'Payment capture failed');
            window.sessionStorage.removeItem('website_video_bundle_id');
            toast.success(`Payment complete! ${res.credits_purchased} videos added.`);
            refreshCredits();
            onClose();
          } catch (err) {
            setError(getErrorMessage(err, 'Payment failed'));
          } finally {
            setBusy(false);
            setBusyMessage('');
          }
        },
      })
      .render(paypalContainerRef.current);
  }, [open, loaded, bundle.id, refreshCredits, onClose]);

  const handleUsdc = async () => {
    setError('');
    setBusy(true);
    setBusyMessage('Generating USDC payment link...');
    try {
      const spec = await websiteVideoService.getPaySpec(bundle.id);
      if (!spec.verification_url) throw new Error('No payment link returned');
      window.open(spec.verification_url, '_blank');
      setBusyMessage(
        `Approved in the new tab? Click "Confirm payment" once you've completed it on Base.`
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to generate payment link'));
    } finally {
      setBusy(false);
    }
  };

  const handleUsdcConfirm = async () => {
    // The x402 cross-site flow returns a signed payment token. When the final
    // backend settles (e.g. the facilitator posts back to the app), the user's
    // credits refresh automatically. This confirm step re-checks credits.
    setError('');
    toast.success('Checking payment status...');
    refreshCredits();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Buy {bundle.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {bundle.credits} videos · ${bundle.priceUsd}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bundle.description}
          </Typography>
        </Box>

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
          <Box>
            {sdkError ? (
              <Alert severity="warning">{sdkError}</Alert>
            ) : busy ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="body2">{busyMessage}</Typography>
              </Box>
            ) : (
              <Box ref={paypalContainerRef} sx={{ minHeight: 90 }} />
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pay {bundle.priceUsd} USDC on the Base network. You'll approve an
              EIP-3009 authorization in your wallet via the secure payment page.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              USDC payment is handled by the native on-chain checkout. After
              approving, your videos are added to your account automatically.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              disabled={busy}
              onClick={handleUsdc}
            >
              {busy ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} /> {busyMessage}
                </Box>
              ) : (
                'Pay with USDC on Base'
              )}
            </Button>
            {busy && (
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleUsdcConfirm}
              >
                I've completed payment — add my videos
              </Button>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">
          All videos are generated by AI from your website URL. No subscription
          required. Your purchased videos never expire.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}