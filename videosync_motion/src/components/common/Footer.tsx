import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Divider } from '@mui/material';

export const SUPPORT_EMAIL = 'support@videosync.ink';

interface FooterProps {
  appName: string;
}

/** Public footer for campaign apps: legal pages + contact. */
export function Footer({ appName }: FooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: { xs: 4, md: 5 },
        px: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(34,211,238,0.06)'
            : 'rgba(34,211,238,0.05)',
        width: '100%',
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {appName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Daily AI content campaigns.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Contact us:{' '}
            <Typography
              component="a"
              href={`mailto:${SUPPORT_EMAIL}`}
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              {SUPPORT_EMAIL}
            </Typography>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography component={RouterLink} to="/terms" variant="body2" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Terms of Service
              </Typography>
              <Typography component={RouterLink} to="/privacy" variant="body2" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Privacy Policy
              </Typography>
              <Typography component={RouterLink} to="/refund" variant="body2" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Refund Policy
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography component={RouterLink} to="/contact" variant="body2" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Contact Us
              </Typography>
              <Typography component={RouterLink} to="/login" variant="body2" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Sign In
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ my: 2, maxWidth: 1100, mx: 'auto' }} />
      <Typography variant="caption" color="text.disabled" align="center" sx={{ display: 'block' }}>
        © {new Date().getFullYear()} VideoSync. All rights reserved.
      </Typography>
    </Box>
  );
}
