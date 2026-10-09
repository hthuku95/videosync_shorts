import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, Tabs, Tab, Chip,
} from '@mui/material';
import { campaignService } from '@/services/campaign.service';
import { usePayPalScript } from '@/hooks/usePayPalScript';

export interface AppTier {
  id: string;
  name: string;
  price: string;
  accounts: number;
  blurb: string;
  current?: boolean;
}

/**
 * Agency tier purchase dialog (shared pattern across all 5 campaign apps).
 * Base tier is included in the app subscription; agency tiers raise the
 * connected-account cap. PayPal or USDC, same rails as campaigns.
 */
export function TierDialog({
  open,
  onClose,
  app,
  appName,
  tiers,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  app: string;
  appName: string;
  tiers: AppTier[];
  onChanged: () => void;
}) {
  const [tier, setTier] = useState<AppTier>(tiers[0]);
  const [tab, setTab] = useState<0 | 1>(0);

  useEffect(() => {
    if (open) {
      setTab(0);
      setTier(tiers[0]);
    }
  }, [open, tiers]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Account tiers — {appName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your plan caps how many social accounts you can connect across all
          campaigns. Upgrade to raise it — priced per app, billed monthly.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          {tiers.map((t) => (
            <Card
              key={t.id}
              variant={tier.id === t.id ? 'elevation' : 'outlined'}
              sx={{
                flex: '1 1 160px',
                cursor: 'pointer',
                borderColor: tier.id === t.id ? 'primary.main' : undefined,
                borderWidth: tier.id === t.id ? 2 : undefined,
              }}
              onClick={() => setTier(t)}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>
                  {t.name}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ my: 0.5 }}>
                  {t.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.accounts} accounts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.blurb}
                </Typography>
                {t.current && (
                  <Box sx={{ mt: 1 }}>
                    <Chip label="Current" size="small" color="success" />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
        {tier.current ? (
          <Alert severity="info">This is your current tier.</Alert>
        ) : (
          <>
            <Tabs value={tab} onChange={(_, v: 0 | 1) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="PayPal / Card" />
              <Tab label="USDC (Base)" />
            </Tabs>
            {tab === 0 ? (
              <TierPaypal app={app} tier={tier} onPaid={() => { onChanged(); onClose(); }} />
            ) : (
              <TierUsdc app={app} tier={tier} onPaid={() => { onChanged(); onClose(); }} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TierPaypal({
  app,
  tier,
  onPaid,
}: {
  app: string;
  tier: AppTier;
  onPaid: () => void;
}) {
  const { loaded, error: sdkError } = usePayPalScript();
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loaded || !window.paypal?.Buttons || !ref.current) return;
    ref.current.innerHTML = '';
    window.paypal
      .Buttons({
        style: { layout: 'vertical', shape: 'rect' },
        createOrder: async () => {
          setError('');
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/tiers/paypal-order`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({ app, tier: tier.id }),
            },
          ).then((r) => r.json());
          if (!res.success || !res.paypal_order_id) throw new Error(res.error || 'Failed to create order');
          return res.paypal_order_id;
        },
        onApprove: async (data: any, actions: any) => {
          setBusy(true);
          try {
            await actions.order.capture();
            const res = await campaignService.tierPaypalActivate(app, tier.id, data.orderID);
            if (!res.success) throw new Error(res.error || 'Activation failed');
            onPaid();
          } catch (e: any) {
            setError(e.message || 'Payment failed');
          } finally {
            setBusy(false);
          }
        },
      })
      .render(ref.current);
  }, [loaded, app, tier, onPaid]);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {sdkError ? (
        <Alert severity="warning">{sdkError}</Alert>
      ) : busy ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box ref={ref} sx={{ minHeight: 90 }} />
      )}
    </Box>
  );
}

function TierUsdc({
  app,
  tier,
  onPaid,
}: {
  app: string;
  tier: AppTier;
  onPaid: () => void;
}) {
  const [amountUsd, setAmountUsd] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignService
      .tierPaySpec(app, tier.id)
      .then((spec: any) => {
        const atomic = spec?.accepts?.[0]?.maxAmountRequired ?? spec?.accepts?.[0]?.max_amount_required;
        if (atomic != null) setAmountUsd(`$${(Number(atomic) / 1e4 / 100).toFixed(2)}`);
        setReady(true);
      })
      .catch((e: any) => {
        setError(e?.response?.data?.error || e.message || 'Failed to load price');
        setReady(true);
      });
  }, [app, tier]);

  if (!ready) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  return <TierUsdcSigner app={app} tier={tier} amountUsd={amountUsd} onPaid={onPaid} />;
}

function TierUsdcSigner({
  app,
  tier,
  amountUsd,
  onPaid,
}: {
  app: string;
  tier: AppTier;
  amountUsd: string;
  onPaid: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error('No crypto wallet found. Install MetaMask or Coinbase Wallet.');
      setStatus('Connecting wallet…');
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      const from: string | undefined = accounts?.[0];
      if (!from) throw new Error('Wallet connection was rejected.');
      const chainId: string = await eth.request({ method: 'eth_chainId' });
      if (chainId?.toLowerCase() !== '0x2105') {
        setStatus('Switching to Base…');
        try {
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] });
        } catch {
          throw new Error('Please switch your wallet to Base and try again.');
        }
      }
      setStatus('Fetching payment details…');
      const spec: any = await campaignService.tierPaySpec(app, tier.id);
      const accept = spec?.accepts?.[0] || {};
      const to: string | undefined = accept.payTo || accept.pay_to;
      const value: string | undefined = accept.maxAmountRequired || accept.max_amount_required;
      const asset: string = accept.asset || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      const timeoutSecs: number = accept.maxTimeoutSeconds || accept.max_timeout_seconds || 300;
      if (!to || !value) throw new Error('Payment details missing.');
      const now = Math.floor(Date.now() / 1000);
      const authorization = {
        from,
        to,
        value,
        validAfter: '0',
        validBefore: String(now + timeoutSecs),
        nonce: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join(''),
      };
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          TransferWithAuthorization: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'validAfter', type: 'uint256' },
            { name: 'validBefore', type: 'uint256' },
            { name: 'nonce', type: 'bytes32' },
          ],
        },
        primaryType: 'TransferWithAuthorization',
        domain: { name: 'USD Coin', version: '2', chainId: 8453, verifyingContract: asset },
        message: authorization,
      };
      setStatus('Waiting for wallet signature…');
      const signature: string = await eth.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(typedData)],
      });
      if (!signature) throw new Error('Signature was rejected.');
      setStatus('Settling on-chain…');
      const bin = new TextEncoder().encode(
        JSON.stringify({
          x402Version: 1,
          scheme: accept.scheme || 'exact',
          network: accept.network || 'base',
          payload: { signature, authorization },
        }),
      );
      let s = '';
      bin.forEach((b) => {
        s += String.fromCharCode(b);
      });
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tiers/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Payment': btoa(s),
        },
        body: JSON.stringify({ app, tier: tier.id }),
      }).then((r) => r.json());
      if (!res.success) throw new Error(res.error || 'Settlement failed.');
      onPaid();
    } catch (e: any) {
      setError(e?.message || 'USDC payment failed.');
    } finally {
      setBusy(false);
      setStatus('');
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pay {amountUsd} USDC on Base for {tier.name}. Sign one authorization in
        your wallet — the tier activates automatically once it settles.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button variant="contained" fullWidth disabled={busy} onClick={pay}>
        {busy ? status || 'Processing…' : `Pay ${amountUsd} USDC`}
      </Button>
    </Box>
  );
}
