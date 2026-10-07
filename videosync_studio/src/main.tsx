import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Offer = {
  id: string;
  title: string;
  price: string;
  buyer: string;
  promise: string;
  deliverables: string[];
  accent: string;
  pattern: 'url' | 'clip' | 'mockup' | 'education' | 'scene' | 'audio' | 'agency';
};

const API_BASE = import.meta.env.VITE_VIDEOSYNC_API_BASE || 'https://www.videosync.video';

const offers: Offer[] = [
  {
    id: 'saas-demo-launch',
    title: 'SaaS/App Demo Launch Pack',
    price: '$699',
    buyer: 'SaaS founders, app owners, Product Hunt launches',
    promise: 'Send a URL, screenshots, or Loom. The AI agent produces a launch-ready demo video with hooks, hero visual, and delivery link.',
    deliverables: ['Product demo video', '3 hook/caption variants', 'Thumbnail or hero visual', 'Downloadable delivery page'],
    accent: '#3b82f6',
    pattern: 'url',
  },
  {
    id: 'agency-3-videos',
    title: 'Website-to-Video Agency Pack',
    price: '$1,500',
    buyer: 'Webflow, Framer, no-code, SaaS, and marketing agencies',
    promise: 'Send 3 client websites. The AI agent produces 3 client-ready demo videos you can resell or deliver under your own brand.',
    deliverables: ['3 demo videos', '3 delivery pages', 'Client-ready downloads', 'Upsell path into monthly fulfillment'],
    accent: '#0ea5e9',
    pattern: 'agency',
  },
  {
    id: 'product-mockup-standard',
    title: 'Product Mockup Video Pack',
    price: '$599',
    buyer: 'Founders and teams with screenshots or unfinished footage',
    promise: 'Turn screenshots, app flows, or landing pages into animated product mockup videos — produced autonomously by the AI agent.',
    deliverables: ['Browser/device scenes', 'Animated callouts', 'Product story', 'Ad-ready export'],
    accent: '#14b8a6',
    pattern: 'mockup',
  },
  {
    id: 'education-explainer-standard',
    title: 'Education Explainer Pack',
    price: '$750',
    buyer: 'Technical creators, educators, founders, and course sellers',
    promise: 'Turn a topic or outline into visual diagrams, narration, and a clear explainer — all agent-produced.',
    deliverables: ['Manim/LaTeX-ready concepts', 'Narrated explainer', 'Visual diagrams', 'Review/download page'],
    accent: '#22c55e',
    pattern: 'education',
  },
  {
    id: 'blender-scene-standard',
    title: 'Blender 2D/3D Scene Pack',
    price: '$1,200',
    buyer: 'Product teams and agencies needing distinctive motion visuals',
    promise: 'Create 2D/3D scenes, product animations, and cinematic support visuals for demos or ads.',
    deliverables: ['Scene brief', 'Rendered visuals', 'Camera/lighting polish', 'Reusable video assets'],
    accent: '#a855f7',
    pattern: 'scene',
  },
  {
    id: 'clip-enhancement-standard',
    title: 'Clip Enhancement Pack',
    price: '$600',
    buyer: 'Creators, agencies, coaches, and brands with raw clips',
    promise: 'Turn existing clips into polished social-ready videos with captions, graphics, and variants.',
    deliverables: ['10 clip pack', 'Captions + graphics', 'Thumbnail frames', 'Platform variants'],
    accent: '#f97316',
    pattern: 'clip',
  },
  {
    id: 'audio-standard',
    title: 'Voice & Audio Production Pack',
    price: '$300',
    buyer: 'Founders, educators, newsletter operators, and agencies',
    promise: 'Create narration, voiceovers, summaries, and audio-backed video assets.',
    deliverables: ['Script polish', 'Voiceover/narration', 'Audio-backed video', 'Downloadable files'],
    accent: '#ec4899',
    pattern: 'audio',
  },
];

async function startCheckout(offerId: string) {
  const response = await fetch(`${API_BASE}/api/paypal/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: offerId }),
  });
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || 'Could not create PayPal order');
  }

  const approveLink = payload.order?.links?.find((link: { rel: string }) => link.rel === 'approve')?.href;
  if (!approveLink) {
    throw new Error('PayPal did not return an approval link');
  }

  window.location.href = approveLink;
}

async function captureCheckout(orderId: string) {
  const response = await fetch(`${API_BASE}/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || 'Could not capture PayPal order');
  }
  return payload;
}

async function startCryptoCheckout(offerId: string): Promise<void> {
  const provider = (window as any).phantom?.ethereum || (window as any).ethereum;
  if (!provider) {
    throw new Error('No crypto wallet detected. Install Phantom, MetaMask, or Coinbase Wallet.');
  }

  let accounts: string[];
  try {
    accounts = await provider.request({ method: 'eth_requestAccounts' });
  } catch {
    throw new Error('Wallet connection rejected.');
  }
  const from = accounts[0];

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }],
    });
  } catch {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x2105',
          chainName: 'Base',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        }],
      });
    } catch {
      throw new Error('Switch your wallet to Base network and try again.');
    }
  }

  const specResp = await fetch(`${API_BASE}/api/crypto/unlock-spec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: offerId }),
  });
  const specData = await specResp.json();
  if (!specData.success) {
    throw new Error(specData.error || 'Failed to get payment spec');
  }

  const req = specData.x402?.accepts?.[0];
  if (!req) {
    throw new Error('Payment spec missing requirements.');
  }

  const validAfter = 0;
  const validBefore = Math.floor(Date.now() / 1000) + req.maxTimeoutSeconds;
  const nonce = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

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
      name: req.extra?.name || 'USD Coin',
      version: req.extra?.version || '2',
      chainId: 8453,
      verifyingContract: req.asset,
    },
    message: {
      from,
      to: req.payTo,
      value: req.maxAmountRequired,
      validAfter,
      validBefore,
      nonce,
    },
  };

  let signature: string;
  try {
    signature = await provider.request({
      method: 'eth_signTypedData_v4',
      params: [from, JSON.stringify(typedData)],
    });
  } catch {
    throw new Error('Signature rejected.');
  }

  const xPaymentBody = {
    x402Version: 1,
    scheme: req.scheme,
    network: req.network,
    payload: {
      signature,
      authorization: {
        from,
        to: req.payTo,
        value: req.maxAmountRequired,
        validAfter: String(validAfter),
        validBefore: String(validBefore),
        nonce,
      },
    },
  };
  const xPaymentB64 = btoa(JSON.stringify(xPaymentBody));

  const unlockResp = await fetch(`${API_BASE}/api/crypto/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Payment': xPaymentB64 },
    body: JSON.stringify({ offer_id: offerId }),
  });
  const unlockData = await unlockResp.json();
  if (!unlockResp.ok || !unlockData.success) {
    throw new Error(unlockData.error || 'Payment settlement failed');
  }
}

function OfferCard({ offer, onPaymentSuccess }: { offer: Offer; onPaymentSuccess: (msg: string) => void }) {
  const [paypalBusy, setPaypalBusy] = React.useState(false);
  const [cryptoBusy, setCryptoBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const onBuyPayPal = async () => {
    setPaypalBusy(true);
    setError('');
    try {
      await startCheckout(offer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setPaypalBusy(false);
    }
  };

  const onBuyUSDC = async () => {
    setCryptoBusy(true);
    setError('');
    try {
      await startCryptoCheckout(offer.id);
      onPaymentSuccess(`Payment received for ${offer.title}. Your order is confirmed.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'USDC payment failed');
      setCryptoBusy(false);
    }
  };

  const displayPrice = parseFloat(offer.price.replace(/[$,]/g, ''));
  const usdcLabel = `Pay ${displayPrice} USDC`;

  return (
    <article className={`offer-card pattern-${offer.pattern}`} style={{ '--accent': offer.accent } as React.CSSProperties}>
      <div className="card-art" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="card-body">
        <div className="card-kicker">{offer.buyer}</div>
        <h3>{offer.title}</h3>
        <div className="card-price">{offer.price}</div>
        <p>{offer.promise}</p>
        <ul>
          {offer.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="card-actions">
        <button className="buy-button" onClick={onBuyPayPal} disabled={paypalBusy || cryptoBusy}>
          {paypalBusy ? 'Opening PayPal...' : 'PayPal / Card'}
        </button>
        <button className="buy-button usdc-button" onClick={onBuyUSDC} disabled={cryptoBusy || paypalBusy}>
          {cryptoBusy ? 'Connecting wallet...' : `${usdcLabel} USDC`}
        </button>
      </div>
      {error && <div className="checkout-error">{error}</div>}
    </article>
  );
}

function App() {
  const [checkoutStatus, setCheckoutStatus] = React.useState<{
    kind: 'success' | 'error' | 'cancel' | 'capturing';
    message: string;
  } | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedFromPayPal = params.get('paypal_return') === '1';
    const cancelledPayPal = params.get('paypal_cancel') === '1';
    const orderId = params.get('token');

    if (cancelledPayPal) {
      setCheckoutStatus({
        kind: 'cancel',
        message: 'Checkout was cancelled. You can choose a pack whenever you are ready.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (!returnedFromPayPal || !orderId) {
      return;
    }

    let cancelled = false;
    setCheckoutStatus({ kind: 'capturing', message: 'Confirming your PayPal payment...' });
    captureCheckout(orderId)
      .then(() => {
        if (cancelled) return;
        setCheckoutStatus({
          kind: 'success',
          message: 'Payment received. Your VideoSync Studio order is ready for intake.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch((err) => {
        if (cancelled) return;
        setCheckoutStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : 'PayPal capture failed',
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePaymentSuccess = (message: string) => {
    setCheckoutStatus({ kind: 'success', message });
  };

  return (
    <main>
      <nav className="topbar">
        <a href="/" className="brand">VideoSync Studio</a>
        <div className="nav-links">
          <a href="#offers">Offers</a>
          <a href={`${API_BASE}/services`}>Main Services</a>
          <a href={`${API_BASE}/chat`}>Workspace</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Managed AI video production</div>
          <h1>Buy polished product videos, explainers, mockups, scenes, and clip packs without waiting on a traditional studio.</h1>
          <p>
            VideoSync Studio is the sales-focused home for premium service packs. The main VideoSync app remains the
            $15/month AI workspace; this studio is for fast buyer-facing deliverables and paid service orders.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#offers">Choose a service</a>
            <a className="button secondary" href={`${API_BASE}/chat?prompt=Help%20me%20choose%20a%20VideoSync%20Studio%20service%20pack.&autosend=1`}>Help me choose</a>
          </div>
        </div>
        <div className="hero-board" aria-hidden="true">
          <div className="timeline-row wide" />
          <div className="timeline-row" />
          <div className="scene-tile" />
          <div className="waveform">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="pricing-note">
        <strong>Pricing is positioned for speed + automation leverage.</strong>
        Market alternatives range from cheap template work to multi-thousand-dollar agency production. These packs sit in
        the practical middle: fast enough for 24-hour sales, premium enough to make fulfillment worth doing.
      </section>

      <section className="payment-methods-info">
        <span className="pill">PayPal / Card</span>
        <span className="pill pill-usdc">USDC on Base</span>
        <span className="pill">No account needed for crypto</span>
      </section>

      {checkoutStatus && (
        <section className={`checkout-status ${checkoutStatus.kind}`}>
          <strong>
            {checkoutStatus.kind === 'success'
              ? 'Payment confirmed'
              : checkoutStatus.kind === 'capturing'
                ? 'Almost there'
                : checkoutStatus.kind === 'cancel'
                  ? 'Checkout cancelled'
                  : 'Checkout needs attention'}
          </strong>
          <span>{checkoutStatus.message}</span>
          {checkoutStatus.kind === 'success' && (
            <a href={`${API_BASE}/chat?prompt=I%20just%20bought%20a%20VideoSync%20Studio%20service%20pack.%20Help%20me%20submit%20the%20brief%20and%20source%20assets.&autosend=1`}>
              Open intake workspace
            </a>
          )}
        </section>
      )}

      <section id="offers" className="offer-grid">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onPaymentSuccess={handlePaymentSuccess} />
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
