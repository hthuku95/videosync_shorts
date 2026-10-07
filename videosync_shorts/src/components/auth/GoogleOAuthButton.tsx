import { Button } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export interface GoogleOAuthButtonProps {
  text?: string;
}

export function GoogleOAuthButton({ text = 'Continue with Google' }: GoogleOAuthButtonProps) {
  const { loginWithGoogle } = useAuth();

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={() => loginWithGoogle()}
      sx={{ mt: 2 }}
    >
      {text}
    </Button>
  );
}