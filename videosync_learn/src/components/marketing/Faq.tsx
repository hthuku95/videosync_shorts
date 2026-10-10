import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import { ExpandMore as ExpandIcon } from '@mui/icons-material';
import { Reveal } from './Reveal';

export interface FaqItem {
  q: string;
  a: string;
}

/** FAQ accordion (shared marketing pattern). */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Box>
      {items.map((f, i) => (
        <Reveal key={f.q} delay={Math.min(i * 0.04, 0.2)}>
          <Accordion
            disableGutters
            sx={{
              mb: 1,
              borderRadius: 2,
              '&:before': { display: 'none' },
              bgcolor: 'action.hover',
            }}
          >
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {f.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {f.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Reveal>
      ))}
    </Box>
  );
}
