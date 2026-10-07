import { Box, Container, Paper, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '@/theme';

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #0ea5e9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Decorative blurred circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <ThemeProvider theme={darkTheme}>
        <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.02em' }}
            >
              Website Video
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(238,240,255,0.65)', mt: 0.5 }}>
              AI videos from your website URL
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              background: 'rgba(20,20,32,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(238,240,255,0.12)',
              borderRadius: 3,
            }}
          >
            <Outlet />
          </Paper>
        </Container>
      </ThemeProvider>
    </Box>
  );
}