import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';

const whiteLogos = [
  '/assets/forums/IEEE.jpg',
  '/assets/forums/IEDC.jpg',
  '/assets/forums/GDSC.jpg',
  '/assets/forums/TINKERHUB.jpg',
  '/assets/forums/MULEARN.jpg',
  '/assets/forums/FOCES.jpg',
];

const darkLogos = [
  '/assets/forums/IEEE.jpg',
  '/assets/forums/IEDC.jpg',
  '/assets/forums/GDSC.jpg',
  '/assets/forums/TINKERHUB.jpg',
  '/assets/forums/MULEARN.jpg',
  '/assets/forums/FOCES.jpg',
];

const logoStyle = {
  width: '100px',
  height: '100px',
  margin: '0 32px',
  opacity: 1,
  borderRadius:"2rem"
};

export default function LogoCollection() {
  const theme = useTheme();
  const logos = theme.palette.mode === 'light' ? darkLogos : whiteLogos;

  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography
        component="p"
        variant="subtitle1"
        align="center"
        color="text.primary"
      >
        Our Forums
      </Typography>
      <Grid container justifyContent="center" sx={{ mt: 2.5, opacity: 0.6, gap: {xs: 3, sm: 1 } }}>
        {logos.map((logo, index) => (
          <Grid item key={index}>
            <img
              src={logo}
              alt={`Forum Number ${index + 1}`}
              style={logoStyle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
