import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PATHS } from '@/routes/paths';
import { useCredits } from '@/hooks/useCredits';
import { websiteVideoService } from '@/services/websiteVideo.service';
import { getErrorMessage } from '@/utils/errors';

const STYLES = ['cinematic', 'clean minimal', 'bold colorful', 'corporate', 'playful'];

export function GeneratePage() {
  const navigate = useNavigate();
  const { remaining, isLoading: creditsLoading } = useCredits();

  const [sourceUrl, setSourceUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [brief, setBrief] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState('');
  const [clientError, setClientError] = useState('');

  const generateMutation = useMutation({
    mutationFn: () =>
      websiteVideoService.generateVideo({
        source_url: sourceUrl,
        ...(productName ? { product_name: productName } : {}),
        ...(brief ? { brief } : {}),
        style,
        ...(duration ? { duration: Number(duration) } : {}),
      }),
    onSuccess: (data) => {
      if (!data.success) {
        setClientError(data.error || 'Failed to start generation');
        return;
      }
      toast.success('Video generation started!');
      navigate(PATHS.VIDEOS);
    },
    onError: (err: unknown) => {
      setClientError(getErrorMessage(err, 'Failed to start generation'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    let url = sourceUrl.trim();
    if (!url) {
      setClientError('Please enter your website URL');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
      setSourceUrl(url);
    }
    if (!/^https?:\/\/.+\..{2,}$/i.test(url)) {
      setClientError('Please enter a valid website URL (e.g. https://example.com)');
      return;
    }

    if (remaining <= 0) {
      setClientError('You have no video credits left. Please buy a bundle to continue.');
      return;
    }

    generateMutation.mutate();
  };

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Generate Video
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {creditsLoading
            ? 'Loading your credits...'
            : `You have ${remaining} video${
                remaining === 1 ? '' : 's'
              } remaining.`}
        </Typography>
      </Box>

      {remaining <= 0 && !creditsLoading && (
        <Alert severity="warning" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={() => navigate(PATHS.BUNDLES)}>
            Buy bundle
          </Button>
        }>
          You're out of credits. Buy a bundle to keep generating videos.
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {clientError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {clientError}
            </Alert>
          )}

          <TextField
            label="Website URL"
            placeholder="https://yourproduct.com"
            fullWidth
            required
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">🔗</InputAdornment>,
            }}
          />

          <TextField
            label="Product name (optional)"
            placeholder="e.g. Acme Analytics"
            fullWidth
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Brief (optional)"
            placeholder="Focus on the dashboard onboarding flow and the pricing page."
            fullWidth
            multiline
            minRows={3}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {STYLES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Target duration (seconds, optional)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              inputProps={{ min: 5 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              type="submit"
              size="large"
              disabled={generateMutation.isPending || remaining <= 0}
              startIcon={
                generateMutation.isPending ? <CircularProgress size={18} /> : undefined
              }
            >
              {generateMutation.isPending ? 'Starting...' : 'Generate video'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        We crawl your website and generate an animated, on-brand video. Rendering
        typically takes a few minutes; you'll see it in "My Videos" when done.
      </Typography>
    </Box>
  );
}