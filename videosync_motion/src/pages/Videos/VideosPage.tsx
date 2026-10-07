import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Refresh as RefreshIcon, PlayCircleOutline as PlayIcon } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { websiteVideoService } from '@/services/websiteVideo.service';
import { VideoStatusChip } from '@/components/video/VideoStatusChip';
import type { Delivery } from '@/types/websiteVideo.types';
import { format } from 'date-fns';

export function VideosPage() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<Delivery | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['websiteVideo', 'videos'],
    queryFn: () => websiteVideoService.listVideos(),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['websiteVideo', 'videos'] });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Videos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All videos generated from your website URL.
          </Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={refresh} variant="outlined">
          Refresh
        </Button>
      </Box>

      {isLoading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : !videos || videos.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No videos yet. Generate your first one from the Generate page.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {[...videos]
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
            .map((v) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={v.id}>
                <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '16/9',
                      borderRadius: 2,
                      overflow: 'hidden',
                      mb: 1.5,
                      bgcolor: (t) =>
                        t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {v.status === 'completed' && v.output_r2_url ? (
                      <Box
                        component="img"
                        src={v.preview_r2_url || v.output_r2_url}
                        alt={v.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <PlayIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    )}
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                    {v.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <VideoStatusChip status={v.status} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {v.created_at ? format(new Date(v.created_at), 'MMM d, yyyy h:mm a') : '—'}
                  </Typography>

                  <Box sx={{ mt: 'auto', pt: 1.5 }}>
                    {v.status === 'completed' && v.output_r2_url ? (
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={() => setPreview(v)}
                      >
                        Play video
                      </Button>
                    ) : v.status === 'failed' ? (
                      <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }} noWrap>
                        {v.error_message || 'Render failed'}
                      </Typography>
                    ) : (
                      <Button fullWidth variant="outlined" size="small" disabled>
                        {v.status === 'running' ? 'Rendering...' : 'Queued'}
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {preview?.title}
          <IconButton onClick={() => setPreview(null)} aria-label="close">
            ✕
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {preview?.output_r2_url && (
            <Box
              component="video"
              controls
              src={preview.output_r2_url}
              poster={preview.preview_r2_url || undefined}
              sx={{ width: '100%', aspectRatio: '16/9', borderRadius: 2 }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}