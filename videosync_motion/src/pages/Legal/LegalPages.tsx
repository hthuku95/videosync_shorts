import { Box, Container, Typography, Divider } from '@mui/material';
import { Footer, SUPPORT_EMAIL } from '@/components/common/Footer';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.7 }}>
        {children}
      </Typography>
    </Box>
  );
}

function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <Box>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 3 }}>
          Last updated: {updated} · VideoSync Motion (motion.videosync.ink)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {children}
      </Container>
      <Footer appName="VideoSync Motion" />
    </Box>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="October 2026">
      <Section title="1. The service">
        VideoSync Motion (“we”, “us”) provides AI-generated motion-graphics campaigns: Manim explainers, whiteboard
        sketches, kinetic typography, infographics, algorithm visualizations,
        pitch decks, recaps, and isometric scenes, posted to social accounts
        you connect. Output is AI-generated content based on your brief and source
        selection — creative direction remains yours, and you are responsible
        for the accounts and sources you connect.
      </Section>
      <Section title="2. Subscription and billing">
        Access is sold as a single monthly subscription (currently $199/month),
        billed in advance through our payment processor (PayPal/card) or in
        USDC on the Base network. Your campaign renders while the subscription
        is active. Prices are shown before checkout and confirmed at payment.
      </Section>
      <Section title="3. Cancellation">
        Cancel anytime from your account — cancellation stops the next billing
        cycle. Already-rendered content remains yours. See the Refund Policy
        for money-back terms.
      </Section>
      <Section title="4. Acceptable use">
        You may not use the service to infringe copyrights, impersonate others,
        or post content you do not have rights to publish. We may pause
        campaigns that trigger repeated platform takedowns or violate connected
        platforms' terms, with notice to you at your account email.
      </Section>
      <Section title="5. Content ownership">
        Videos rendered for your paid campaign are yours to use, including
        commercially, once delivered. Source footage remains the property of its
        owners — clipping does not transfer underlying rights, and you remain
        responsible for how you publish clips.
      </Section>
      <Section title="6. Availability">
        Rendering and posting depend on third-party platforms (Kick, Twitch,
        YouTube, TikTok, social APIs). We do not guarantee uninterrupted posting
        when those platforms are down, rate-limited, or change their APIs, but
        missed posts are re-attempted automatically.
      </Section>
      <Section title="7. Limitation of liability">
        To the maximum extent permitted by law, our liability is limited to the
        fees you paid in the 3 months before the claim. We are not liable for
        platform actions against your accounts (strikes, bans, demonetization).
      </Section>
      <Section title="8. Contact">
        Questions about these terms: {SUPPORT_EMAIL}.
      </Section>
    </LegalShell>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="October 2026">
      <Section title="1. What we collect">
        Account details (email, username), campaign briefs and source selections,
        connected social-account tokens (stored encrypted, used only to publish
        your content), rendered media, and payment confirmations from our
        processors. We never see or store your card numbers or wallet keys —
        those go directly to PayPal or your wallet software.
      </Section>
      <Section title="2. How we use it">
        To operate your campaigns (render, caption, post), to bill you, to
        prevent fraud, and to contact you about your account. We do not sell
        personal data and do not share it except with the processors and
        platforms required to deliver the service (payments, social APIs,
        infrastructure).
      </Section>
      <Section title="3. Content and public data">
        Campaign inputs may reference public streams and videos. Rendered
        outputs are delivered to you and, where you configured auto-posting,
        published to your connected accounts.
      </Section>
      <Section title="4. Retention and deletion">
        Account data is kept while your account is active. Email {SUPPORT_EMAIL}{' '}
        to request export or deletion — deletion removes your account, campaigns,
        and stored media within 30 days, except records we must keep for tax or
        fraud-prevention purposes.
      </Section>
      <Section title="5. Security">
        Traffic is encrypted in transit; secrets are stored server-side only.
        No system is perfectly secure — report suspected issues to {SUPPORT_EMAIL}.
      </Section>
    </LegalShell>
  );
}

export function RefundPage() {
  return (
    <LegalShell title="Refund Policy" updated="October 2026">
      <Section title="1. 7-day money-back guarantee">
        If your campaign has not yet published its first post, you may request
        a full refund within 7 days of your first payment — no questions asked.
        Email {SUPPORT_EMAIL} from your account email with your campaign name.
      </Section>
      <Section title="2. After publishing starts">
        Once posts have been rendered or published, the subscription is
        non-refundable for the current billing period (rendering and posting
        capacity is consumed immediately). You can still cancel anytime to stop
        future billing.
      </Section>
      <Section title="3. Failed delivery">
        If we fail to render or post for 7 consecutive days due to faults on
        our side (not platform outages or account strikes), you may request a
        pro-rated credit or refund for the affected period.
      </Section>
      <Section title="4. How refunds are issued">
        Refunds go back through the original payment method (PayPal reversal or
        USDC to your sending wallet) within 10 business days of approval.
      </Section>
    </LegalShell>
  );
}

export function ContactPage() {
  return (
    <LegalShell title="Contact Us" updated="October 2026">
      <Section title="Email us">
        For billing, campaigns, refunds, privacy requests, or anything else:{" "}
        <Typography
          component="a"
          href={`mailto:${SUPPORT_EMAIL}`}
          color="primary"
          sx={{ textDecoration: 'none', fontWeight: 600 }}
        >
          {SUPPORT_EMAIL}
        </Typography>
        . We reply within 1–2 business days.
      </Section>
      <Section title="Before you write">
        Include your account email and, for campaign issues, the campaign name —
        it lets us help without follow-up questions.
      </Section>
    </LegalShell>
  );
}
