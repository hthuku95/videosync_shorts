import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import { Footer } from '@/components/common/Footer';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <TopBar onMenuClick={handleDrawerToggle} />
      <Toolbar />
      <Box sx={{ display: 'flex', flex: '1 1 auto', alignItems: 'flex-start' }}>
      {isMobile ? (
        <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} variant="temporary" />
      ) : (
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            top: 64,
            height: 'calc(100dvh - 64px)',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Sidebar open={sidebarOpen} variant="permanent" />
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          minWidth: 0,
          overflowX: 'clip',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
      <Footer appName="VideoSync Motion" />
    </Box>
  );
}