import { Box, Typography, Card, Grid, Button, Stack } from '@mui/material';
import {
  VideoLibrary as UsedIcon,
  AddCircleOutline as AddIcon,
  LocalCafe as RemainingIcon,
  Bolt as TotalIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/routes/paths';
import { useCredits } from '@/hooks/useCredits';
import { websiteVideoService } from '@/services/websiteVideo.service';
import { VideoStatusChip } from '@/components/video/VideoStatusChip';
import { format } from 'date-fns';

export function DashboardPage() {
  const navigate = useNavigate();
  const { remaining, used, purchased, isLoading } = useCredits();

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['websiteVideo', 'videos'],
    queryFn: () => websiteVideoService.listVideos(),
  });

  const stats = [
    {
      label: 'Videos remaining',
      value: `${remaining}`,
      icon: <RemainingIcon />,
      color: 'primary.main',
    },
    { label: 'Videos generated', value: `${used}`, icon: <UsedIcon />, color: 'secondary.main' },
    { label: 'Total purchased', value: `${purchased}`, icon: <TotalIcon />, color: 'success.main' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your Website Video bundles and renders.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box>
                <Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {isLoading ? '—' : s.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.label}
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(PATHS.GENERATE)}>
          Generate a video
        </Button>
        <Button variant="outlined" onClick={() => navigate(PATHS.BUNDLES)}>
          Buy more videos
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent videos
      </Typography>

      {videosLoading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : !videos || videos.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You haven't generated any videos yet.
          </Typography>
          <Button variant="contained" onClick={() => navigate(PATHS.GENERATE)}>
            Create your first video
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {videos.slice(0, 6).map((v) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={v.id}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                  {v.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <VideoStatusChip status={v.status} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {v.created_at ? format(new Date(v.created_at), 'MMM d, yyyy') : '—'}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}