import { useEffect } from 'react';
import { Box, Button, Container, Typography, Grid, Paper, Chip } from '@mui/material';
import {
  RocketLaunch as RocketIcon,
  SmartDisplay as PlayIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAuthStore } from '@/stores/authStore';
import { BUNDLES } from '@/constants/bundles';

const FEATURES = [
  {
    icon: <PlayIcon />,
    title: 'Landing page hero videos',
    desc: 'Turn your website into a scroll-stopping animated hero in seconds.',
  },
  {
    icon: <RocketIcon />,
    title: 'Product demos',
    desc: 'Showcase your product with concise, animated explainer videos.',
  },
  {
    icon: <StarIcon />,
    title: 'Social-ready clips',
    desc: 'Repurpose one idea into short-form cuts ready for any channel.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    document.title = 'Website Video — AI videos from your website URL';
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Nav */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? 'rgba(11,11,20,0.7)' : 'rgba(255,255,255,0.7)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/favicon.svg"
                alt="Website Video"
                sx={{ width: 34, height: 34 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                Website Video
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="text"
                onClick={() => navigate(PATHS.BUNDLES)}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Pricing
              </Button>
              {isAuthenticated ? (
                <Button variant="contained" onClick={() => navigate(PATHS.DASHBOARD)}>
                  Dashboard
                </Button>
              ) : (
                <Button variant="contained" onClick={() => navigate(PATHS.LOGIN)}>
                  Sign in
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip label="AI videos from your website URL" color="primary" variant="outlined" sx={{ mb: 2 }} />
            <Typography
              variant="h2"
              component="h1"
              sx={{ mb: 2, fontSize: { xs: '2.2rem', md: '3.2rem' } }}
            >
              Your website becomes your video — in minutes
            </Typography>
            <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 3, fontWeight: 400 }}>
              Paste your product's URL. We study your site and generate animated,
              on-brand videos your customers actually watch.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" onClick={() => navigate(PATHS.REGISTER)}>
                Get started
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate(PATHS.BUNDLES)}>
                See pricing
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              From {BUNDLES[0].priceUsd} {/* e.g. $50 for 10 videos */}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
                color: '#fff',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PlayIcon />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Sample render
                </Typography>
              </Box>
              <Box
                sx={{
                  aspectRatio: '16/9',
                  borderRadius: 3,
                  background: 'rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlayIcon sx={{ fontSize: 64 }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                Drop in your URL → AI generates a hero demo for your product.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.paper' : '#ffffff') }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" sx={{ mb: 4 }}>
            Why teams use Website Video
          </Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid size={{ xs: 12, md: 4 }} key={f.title}>
                <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 1.5, display: 'flex' }}>{f.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Ready to turn your website into video?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          One-time bundles. No subscription. Your videos never expire.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate(PATHS.REGISTER)}>
          Create your account
        </Button>
      </Container>
    </Box>
  );
}