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
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PATHS } from '@/routes/paths';
import { getErrorMessage } from '@/utils/errors';

export function LoginForm() {
  const { login, isLoginLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login(
      { email, password },
      {
        onError: (err) => setError(getErrorMessage(err, 'Login failed')),
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Sign In
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Welcome back to Website Video
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
        disabled={isLoginLoading}
        required
        autoComplete="email"
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoginLoading}
        required
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isLoginLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoginLoading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          New here?{' '}
          <MuiLink component={Link} to={PATHS.REGISTER} underline="hover">
            Create an account
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}