import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  MenuItem,
  TextField,
  Divider,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { useCredits } from '@/hooks/useCredits';

const THEME_MODES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { purchased, used, remaining } = useCredits();
  const { themeMode, setThemeMode } = useUIStore();

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Account
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user?.email || '—'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1">{user?.username || '—'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Video credits
              </Typography>
              <Typography variant="body1">
                {remaining} remaining · {used} used · {purchased} purchased
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={logout}
            >
              Log out
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Appearance
            </Typography>
            <TextField
              select
              label="Theme"
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value as 'system' | 'light' | 'dark')}
              sx={{ minWidth: 200 }}
            >
              {THEME_MODES.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}