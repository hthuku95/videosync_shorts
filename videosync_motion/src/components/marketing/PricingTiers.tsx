import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Reveal } from './Reveal';
import { PATHS } from '@/routes/paths';

export interface TierInfo {
  id: string;
  name: string;
  price: string;
  accounts: number;
  blurb: string;
  featured?: boolean;
}

/** Three-tier pricing with glassmorphism featured card. */
export function PricingTiers({ tiers }: { tiers: TierInfo[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2.5,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        alignItems: 'stretch',
      }}
    >
      {tiers.map((t, i) => (
        <Reveal key={t.id} delay={i * 0.08}>
          <Card
            sx={{
              height: '100%',
              ...(t.featured
                ? {
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(160deg, rgba(99,102,241,0.22), rgba(56,189,248,0.10))'
                        : 'linear-gradient(160deg, rgba(99,102,241,0.12), rgba(56,189,248,0.06))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid',
                    borderColor: 'primary.main',
                  }
                : {}),
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {t.featured && <Chip label="Most popular" color="primary" size="small" sx={{ mb: 1.5 }} />}
              <Typography variant="h6" fontWeight={700}>
                {t.name}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                {t.price}
                <Typography component="span" variant="body2" color="text.secondary">
                  /mo
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t.accounts} connected accounts · unlimited campaigns
              </Typography>
              <Typography variant="body2" sx={{ mb: 2.5, minHeight: 40 }}>
                {t.blurb}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2.5 }}>
                <CheckIcon fontSize="small" color="success" />
                <Typography variant="body2">Up to 5 posts a day</Typography>
              </Box>
              <Button
                variant={t.featured ? 'contained' : 'outlined'}
                fullWidth
                component={RouterLink}
                to={PATHS.REGISTER}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </Box>
  );
}
