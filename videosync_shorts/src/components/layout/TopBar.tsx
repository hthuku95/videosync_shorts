import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7, AccountCircle } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore, getEffectiveTheme } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { PATHS } from '@/routes/paths';
import { useCredits } from '@/hooks/useCredits';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useUIStore();
  const { logout, user } = useAuth();
  const { remaining } = useCredits();
  const effectiveTheme = getEffectiveTheme(themeMode);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClose = () => setAnchorEl(null);

  const handleSettings = () => {
    handleMenuClose();
    navigate(PATHS.SETTINGS);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar elevation={0} position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 1.5 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            flexGrow: 1,
          }}
        >
          Website Video
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${remaining} video${remaining === 1 ? '' : 's'} left`}
            size="small"
            color="secondary"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            onClick={() => navigate(PATHS.BUNDLES)}
          />

          {user?.username && (
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.85)', display: { xs: 'none', sm: 'block' } }}
            >
              {user.username}
            </Typography>
          )}

          <IconButton color="inherit" onClick={toggleTheme}>
            {effectiveTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleSettings}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}