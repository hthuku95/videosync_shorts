import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddCircleOutline as NewCampaignIcon,
  Settings as SettingsIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import {
  useUIStore,
  DEFAULT_SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_COLLAPSE_AT,
  clampSidebarWidth,
} from '@/stores/uiStore';

export const DRAWER_WIDTH = DEFAULT_SIDEBAR_WIDTH;

interface NavItem {
  label: string;
  icon: React.ReactElement;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'My Campaigns', icon: <DashboardIcon />, path: PATHS.DASHBOARD },
  { label: 'New Campaign', icon: <NewCampaignIcon />, path: PATHS.CAMPAIGNS_NEW },
];

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant: 'permanent' | 'temporary';
}

export function Sidebar({ open, onClose, variant }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);

  // Single source of truth for the rail width. The paper width, the page
  // column margin and the navbar shift all derive from this one value, so
  // the sidebar edge and the content edge always share one line (no gap).
  const collapsed = variant === 'permanent' && sidebarCollapsed;
  const railWidth =
    variant === 'temporary'
      ? DEFAULT_SIDEBAR_WIDTH
      : collapsed
        ? SIDEBAR_COLLAPSED_WIDTH
        : clampSidebarWidth(sidebarWidth);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose?.();
    }
  };

  // Drag-to-resize (ChatGPT-style). Dragging left past the snap point
  // collapses to the icon rail; the expand button restores the width.
  const startResize = (e: React.PointerEvent) => {
    if (variant !== 'permanent' || collapsed) return;
    e.preventDefault();
    const startX = e.clientX;
    const startW = clampSidebarWidth(useUIStore.getState().sidebarWidth);
    const move = (ev: PointerEvent) => {
      const next = startW + (ev.clientX - startX);
      const st = useUIStore.getState();
      if (next < SIDEBAR_COLLAPSE_AT) {
        if (!st.sidebarCollapsed) st.setSidebarCollapsed(true);
      } else {
        if (st.sidebarCollapsed) st.setSidebarCollapsed(false);
        st.setSidebarWidth(next);
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const renderNavButton = (label: string, icon: React.ReactElement, path: string, selected: boolean) => {
    const button = (
      <ListItemButton
        selected={selected}
        onClick={() => handleNavigation(path)}
        sx={collapsed ? { justifyContent: 'center', px: 1 } : undefined}
      >
        <ListItemIcon sx={collapsed ? { minWidth: 0 } : undefined}>{icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={label} />}
      </ListItemButton>
    );
    return collapsed ? (
      <Tooltip key={path} title={label} placement="right">
        {button}
      </Tooltip>
    ) : (
      <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
        {button}
      </ListItem>
    );
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={
        variant === 'permanent'
          ? {
              // Fixed rail, OUT of the flex flow: the root consumes zero
              // in-flow width, so the page column margin is the ONLY indent
              // (this was the double-indent black gap).
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100dvh',
              width: railWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: railWidth,
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
                overflowX: 'hidden',
              },
            }
          : {
              width: railWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: railWidth,
                boxSizing: 'border-box',
                borderRadius: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }
      }
    >
      <Toolbar sx={collapsed ? { justifyContent: 'center', px: '0 !important' } : undefined}>
        <Box
          sx={
            collapsed
              ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
              : { display: 'flex', alignItems: 'center', gap: 1 }
          }
        >
          <Box
            component="img"
            src="/favicon.svg"
            alt="VideoSync Shorts"
            sx={{ width: 28, height: 28 }}
          />
          {!collapsed && (
            <Box>
              <Box sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                VideoSync Shorts
              </Box>
              <Box sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                YouTube clips
              </Box>
            </Box>
          )}
        </Box>
      </Toolbar>

      <List sx={{ px: 1, py: 1, flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map((item) =>
          collapsed ? (
            renderNavButton(item.label, item.icon, item.path, location.pathname === item.path)
          ) : (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ),
        )}

        {collapsed ? (
          renderNavButton('Settings', <SettingsIcon />, PATHS.SETTINGS, location.pathname === PATHS.SETTINGS)
        ) : (
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
        )}
      </List>

      {variant === 'permanent' && (
        <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', p: 1 }}>
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton size="small" onClick={toggleSidebarCollapsed} aria-label="toggle sidebar">
              {collapsed ? <ExpandIcon /> : <CollapseIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Drag handle on the rail edge (ChatGPT-style resize). */}
      {variant === 'permanent' && !collapsed && (
        <Box
          onPointerDown={startResize}
          onDoubleClick={() => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
          title="Drag to resize · double-click to reset"
          sx={{
            position: 'absolute',
            top: 0,
            right: -5,
            width: 10,
            height: '100%',
            cursor: 'ew-resize',
            zIndex: 1,
            '&:hover::after, &:active::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 4,
              width: 2,
              bgcolor: 'primary.main',
              borderRadius: 1,
            },
          }}
        />
      )}
    </Drawer>
  );
}
