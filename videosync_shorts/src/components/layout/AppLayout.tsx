import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import { useUIStore } from '@/stores/uiStore';

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile, setSidebarOpen]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      <TopBar onMenuClick={handleDrawerToggle} />

      {isMobile ? (
        <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} variant="temporary" />
      ) : (
        <Sidebar open={sidebarOpen} variant="permanent" />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ flex: '1 0 auto', minHeight: 'min-content' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}