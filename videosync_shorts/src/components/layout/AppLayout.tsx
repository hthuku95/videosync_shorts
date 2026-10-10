import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Footer } from '@/components/common/Footer';
import { useUIStore, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/stores/uiStore';

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();
  // The one rail width: column margin + navbar shift derive from it, so all
  // three edges always share the sidebar's right edge (no gap, no overlap).
  const sidebarWidth = useUIStore((s) =>
    s.sidebarCollapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, s.sidebarWidth)),
  );

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile, setSidebarOpen]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      {isMobile ? (
        <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} variant="temporary" />
      ) : (
        <Sidebar open variant="permanent" />
      )}

      {/* Right column begins at the sidebar's right edge (ChatGPT-style):
          navbar, content and footer all live here so nothing overlaps,
          or is overlapped by, the full-height sidebar. */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
        }}
      >
        <TopBar onMenuClick={handleDrawerToggle} shiftWidth={!isMobile ? sidebarWidth : 0} />
        <Toolbar />

        <Box
          component="main"
          sx={{
            flex: '1 0 auto',
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

        <Footer appName="VideoSync Shorts" />
      </Box>
    </Box>
  );
}
