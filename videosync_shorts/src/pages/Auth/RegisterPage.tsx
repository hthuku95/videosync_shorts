import { Box, Divider } from '@mui/material';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

export function RegisterPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <RegisterForm />
      <Divider sx={{ my: 2.5, width: '100%' }}>
        OR
      </Divider>
      <GoogleOAuthButton text="Continue with Google" />
    </Box>
  );
}