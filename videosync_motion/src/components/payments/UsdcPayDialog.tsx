import { useState } from 'react';
import {
  Box, Typography, Button, Alert, CircularProgress,
} from '@mui/material';
import { campaignService } from '@/services/campaign.service';

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_CHAIN_ID = '0x2105'; // 8453
const BASE_CHAIN_DEC = 8453;

interface PaySpecAccept {
  scheme?: string;
  network?: string;
  max_amount_required?: string;
  pay_to?: string;
  asset?: string;
  max_timeout_seconds?: number;
}

function b64encodeJson(obj: unknown): string {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function erc20BalanceOf(
  eth: any,
  token: string,
  owner: string,
): Promise<bigint> {
  // balanceOf(address) selector 0x70a08231, owner padded to 32 bytes
  const data =
    '0x70a08231' + owner.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const res: string = await eth.request({
    method: 'eth_call',
    params: [{ to: token, data }, 'latest'],
  });
  return BigInt(res || '0x0');
}

/**
 * USDC (Base) payment via x402 EIP-3009 — no wallet SDK needed, talks to
 * window.ethereum directly (MetaMask / Coinbase Wallet / Rabby all expose it).
 * Signs TransferWithAuthorization, wraps it as the X-Payment payload the Rust
 * /settle endpoint verifies through the Coinbase facilitator.
 */
export function UsdcPayDialog({
  campaignId,
  amountUsd,
  onPaid,
}: {
  campaignId: string;
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
      if (!eth) {
        throw new Error('No crypto wallet found. Install MetaMask or Coinbase Wallet, then try again.');
      }
      // 1. Connect
      setStatus('Connecting wallet…');
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      const from: string | undefined = accounts?.[0];
      if (!from) throw new Error('Wallet connection was rejected.');

      // 2. Base network
      const chainId: string = await eth.request({ method: 'eth_chainId' });
      if (chainId?.toLowerCase() !== BASE_CHAIN_ID) {
        setStatus('Switching to Base…');
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_CHAIN_ID }],
          });
        } catch {
          throw new Error('Please switch your wallet to the Base network and try again.');
        }
      }

      // 3. Pay-spec (authoritative amount/recipient/asset from the backend)
      setStatus('Fetching payment details…');
      const spec = await campaignService.paySpec(campaignId);
      const accept: PaySpecAccept | undefined = (spec as any)?.accepts?.[0];
      const to: string | undefined = accept?.pay_to;
      const value: string | undefined = accept?.max_amount_required;
      const asset: string = accept?.asset || USDC_BASE;
      const timeoutSecs: number = accept?.max_timeout_seconds || 300;
      if (!to || !value) throw new Error('Payment details missing — please try again.');

      // 4. USDC balance check (fail fast with a clear message)
      setStatus('Checking USDC balance…');
      const balance = await erc20BalanceOf(eth, asset, from).catch(() => 0n);
      if (balance < BigInt(value)) {
        const need = (Number(value) / 1e6).toFixed(2);
        throw new Error(`Insufficient USDC on Base — you need $${need} in the connected wallet.`);
      }

      // 5. Sign EIP-3009 TransferWithAuthorization (USDC: name "USD Coin", version "2")
      const now = Math.floor(Date.now() / 1000);
      const authorization = {
        from,
        to,
        value,
        validAfter: '0',
        validBefore: String(now + timeoutSecs),
        nonce: randomNonce(),
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
        domain: {
          name: 'USD Coin',
          version: '2',
          chainId: BASE_CHAIN_DEC,
          verifyingContract: asset,
        },
        message: authorization,
      };
      setStatus('Waiting for wallet signature…');
      const signature: string = await eth.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(typedData)],
      });
      if (!signature) throw new Error('Signature was rejected.');

      // 6. Wrap as x402 X-Payment + settle. The backend verifies through the
      // Coinbase facilitator, submits on-chain, then activates the campaign.
      setStatus('Settling on-chain…');
      const xPayment = b64encodeJson({
        x402Version: 1,
        scheme: accept?.scheme || 'exact',
        network: accept?.network || 'base',
        payload: { signature, authorization },
      });
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/campaigns/${campaignId}/settle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            'X-App': 'motion',
            'X-Payment': xPayment,
          },
        },
      ).then((r) => r.json());
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
        Pay {amountUsd} USDC on the Base network. Your wallet will ask you to
        sign one authorization — no tokens move until you approve, and the
        campaign activates automatically once it settles.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button variant="contained" fullWidth disabled={busy} onClick={pay}>
        {busy ? (status || 'Processing…') : `Pay ${amountUsd} USDC`}
      </Button>
      {busy && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );
}
