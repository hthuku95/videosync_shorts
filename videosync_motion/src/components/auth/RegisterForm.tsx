import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PATHS } from '@/routes/paths';
import { getErrorMessage } from '@/utils/errors';

const REF_LOCAL_STORAGE_KEY = 'cm_referral_ref';

export function RegisterForm() {
  const { register: registerUser, isRegisterLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const referredBy = (): string | undefined => {
    const fromUrl = searchParams.get('ref')?.trim();
    if (fromUrl) {
      localStorage.setItem(REF_LOCAL_STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    return localStorage.getItem(REF_LOCAL_STORAGE_KEY)?.trim() || undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const ref = referredBy();
    registerUser(
      {
        email,
        username,
        password,
        confirm_password: confirmPassword,
        ...(ref ? { referred_by: ref } : {}),
      },
      {
        onError: (err) => setError(getErrorMessage(err, 'Registration failed')),
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Create Account
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Get your videos from your website URL
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isRegisterLoading}
        required
        autoComplete="email"
      />

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isRegisterLoading}
        required
        autoComplete="username"
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isRegisterLoading}
        required
        autoComplete="new-password"
      />

      <TextField
        label="Confirm Password"
        type="password"
        fullWidth
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isRegisterLoading}
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isRegisterLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isRegisterLoading ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <MuiLink component={Link} to={PATHS.LOGIN} underline="hover">
            Sign in
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}