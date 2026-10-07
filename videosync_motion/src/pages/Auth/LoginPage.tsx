import { Box, Divider } from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

export function LoginPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <LoginForm />
      <Divider sx={{ my: 2.5, width: '100%' }}>
        OR
      </Divider>
      <GoogleOAuthButton />
    </Box>
  );
}