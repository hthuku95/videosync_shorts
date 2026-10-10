import { Box, Typography, Card, CardContent } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { Reveal } from './Reveal';

export interface StepInfo {
  Icon: SvgIconComponent;
  title: string;
  body: string;
}

/** Three-step "how it works" with numbered glass cards. */
export function HowItWorks({ steps }: { steps: StepInfo[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2.5,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
      }}
    >
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.08}>
          <Card
            sx={{
              height: '100%',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: -16,
                  left: 20,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {i + 1}
              </Box>
              <Box sx={{ color: 'primary.main', mt: 1.5, mb: 1 }}>
                <s.Icon sx={{ fontSize: 34 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {s.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {s.body}
              </Typography>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </Box>
  );
}
