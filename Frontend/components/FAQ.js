import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        color="text.primary"
        sx={{
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        Frequently asked questions
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Accordion
          expanded={expanded === 'panel1'}
          onChange={handleChange('panel1')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1d-content"
            id="panel1d-header"
          >
            <Typography component="h3" variant="subtitle2">
              How do I contact tech support if I have a question or issue?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              You can reach our web dev team by emailing
              <Link> webmaster@ceconline.edu </Link>
              We&apos;re here to assist you
              and feedbacks are welcome.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel2'}
          onChange={handleChange('panel2')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2d-content"
            id="panel2d-header"
          >
            <Typography component="h3" variant="subtitle2">
              What's the purpose of this website?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              This is a comprehensive website made for making communications with different forum communities easier and monitor events occuring in the college.This can greatly help in audit purposes.
            </Typography>
          </AccordionDetails>
        </Accordion>
        {/* <Accordion
          expanded={expanded === 'panel3'}
          onChange={handleChange('panel3')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3d-content"
            id="panel3d-header"
          >
            <Typography component="h3" variant="subtitle2">
              What makes your product stand out from others in the market?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Our product distinguishes itself through its adaptability, durability,
              and innovative features. We prioritize user satisfaction and
              continually strive to exceed expectations in every aspect.
            </Typography>
          </AccordionDetails>
        </Accordion> */}
        {/* <Accordion
          expanded={expanded === 'panel4'}
          onChange={handleChange('panel4')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4d-content"
            id="panel4d-header"
          >
            <Typography component="h3" variant="subtitle2">
              Is there a warranty on the product, and what does it cover?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Yes, our product comes with a [length of warranty] warranty. It covers
              defects in materials and workmanship. If you encounter any issues
              covered by the warranty, please contact our customer support for
              assistance.
            </Typography>
          </AccordionDetails>
        </Accordion> */}
      </Box>
    </Container>
  );
}