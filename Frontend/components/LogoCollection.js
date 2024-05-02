import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';

const logoStyle = {
  width: '100px',
  height: '100px',
  margin: '0 32px',
  opacity: 1,
  borderRadius: "2rem"
};

export default function LogoCollection() {
  const theme = useTheme();
  const [organizations, setOrganizations] = React.useState([]);

  React.useEffect(() => {
    const fetchForums = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllForums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.forums.length > 0) {
        setOrganizations(data.forums);
      }
    };
    fetchForums();
  }, []);

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
      <Grid container justifyContent="center" sx={{ mt: 2.5, opacity: 0.6, gap: { xs: 3, sm: 1 } }}>
        {organizations.map((forum, index) => (
          <Grid item key={index}>
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums/${forum}.jpg`}
              alt={`Forum Number ${index + 1}`}
              style={logoStyle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
