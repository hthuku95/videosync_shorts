import { useEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import { PATHS } from '@/routes/paths';

export function HomePage() {
  const [params] = useSearchParams();
  useEffect(() => {
    const ref = params.get('ref');
    if (ref) localStorage.setItem('vs_ref', ref);
  }, [params]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }}>
        <Chip label="Daily animated explainer lessons" color="primary" sx={{ mb: 2 }} />
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 800 }}>
          VideoSync Learn
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 720, mx: 'auto' }}>
          Manim-powered lessons generated fresh every day — narrated, diagrammed, and posted for your audience.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
          <Button variant="contained" size="large" component={RouterLink} to={PATHS.REGISTER}>
            Start Learning — $199/month
          </Button>
          <Button variant="outlined" size="large" component={RouterLink} to={PATHS.LOGIN}>
            Sign In
          </Button>
        </Box>
      </Box>
      <Card sx={{ mb: 6 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
            $199/month
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            One subscription. Up to 3 posts a day across your connected platforms. Cancel anytime.
          </Typography>
          <Button variant="contained" size="large" component={RouterLink} to={PATHS.REGISTER}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
