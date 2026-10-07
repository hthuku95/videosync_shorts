import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Card, CardContent, MenuItem, Alert,
} from '@mui/material';
import { campaignService } from '@/services/campaign.service';

const SERVICES = [{ value: 'manim_explainer', label: 'Manim Explainer', hint: '' }, { value: 'whiteboard_animation', label: 'Whiteboard Animation', hint: '' }, { value: 'kinetic_typography', label: 'Kinetic Typography', hint: '' }, { value: 'animated_infographic', label: 'Animated Infographic', hint: '' }, { value: 'algorithm_viz', label: 'Algorithm Viz', hint: '' }, { value: 'investor_pitch', label: 'Investor Pitch', hint: '' }, { value: 'year_in_review', label: 'Year in Review', hint: '' }, { value: 'isometric_explainer', label: 'Isometric Explainer', hint: '' }] as const;

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState<string>('manim_explainer');
  const [brief, setBrief] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name || !brief) {
      setError('Name and brief are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await campaignService.create({
        name,
        service_type: serviceType,
        brief,
        source_url: sourceUrl || undefined,
        schedule: [
          { time: '08:00', platform: 'youtube' },
          { time: '12:00', platform: 'tiktok' },
          { time: '17:00', platform: 'youtube' },
        ],
        platforms: [],
        posts_per_day: 3,
        start_date: new Date(todayStr()).toISOString(),
        end_date: new Date(todayStr(30)).toISOString(),
      });
      if (res.success && res.id) navigate(`/campaigns/${res.id}`);
      else setError(res.error || 'Failed to create campaign');
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        New Manim Services Campaign
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        One $149/mo subscription covers everything here. 3 posts a day, auto-rendered and posted.
      </Typography>
      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            label="Service"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            fullWidth
          >
            {SERVICES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.hint}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Campaign name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required placeholder="e.g. Daily Neon clips" />
          <TextField
            label="Brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            fullWidth
            required
            multiline
            minRows={3}
            placeholder="What should the AI clip and how should it feel? e.g. Funniest moments, high energy, karaoke captions…"
          />
          <TextField
            label="Source URL (channel or VOD)"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            fullWidth
            placeholder="https://kick.com/neon or https://twitch.tv/jynxzi"
          />
          <Button variant="contained" size="large" onClick={submit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Campaign'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
