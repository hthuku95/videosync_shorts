import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddCircleOutline as GenerateIcon,
  PlayCircleOutline as VideosIcon,
  LocalOffer as PricingIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';

export const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  icon: React.ReactElement;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: PATHS.DASHBOARD },
  { label: 'Generate Video', icon: <GenerateIcon />, path: PATHS.GENERATE },
  { label: 'My Videos', icon: <VideosIcon />, path: PATHS.VIDEOS },
  { label: 'Pricing', icon: <PricingIcon />, path: PATHS.BUNDLES },
];

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant: 'permanent' | 'temporary';
}

export function Sidebar({ open, onClose, variant }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose?.();
    }
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/favicon.svg"
            alt="Website Video"
            sx={{ width: 28, height: 28 }}
          />
          <Box>
            <Box sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>Website Video</Box>
            <Box sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }}>
              URL to Video
            </Box>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={location.pathname === PATHS.SETTINGS}
            onClick={() => handleNavigation(PATHS.SETTINGS)}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}