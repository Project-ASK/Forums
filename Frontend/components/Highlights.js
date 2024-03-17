import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Highlights() {
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    const fetchAllEvents = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllEvents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      let currentEvents = data.events.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(currentEvents);
    }
    fetchAllEvents();
  }, []);

  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: '#06090a',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4">
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Explore why our product stands out: adaptability, durability,
            user-friendly design, and innovation. Enjoy reliable customer support and
            precision in every detail.
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {events.map((event, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                color="inherit"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  p: 2,
                  height: '100%',
                  width:"90%",
                  border: '3px solid',
                  borderColor: '#4287f5',
                  background: 'transparent',
                  backgroundColor: 'grey.400',
                  margin:"auto"
                }}
              >
                <Box sx={{ opacity: '100%' }}>
                  <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.imagePath}`} alt="event-image" className="object-cover w-full h-auto rounded-lg" />
                </Box>
                <div>
                  <Typography fontWeight="medium" gutterBottom className="text-xl">
                    {event.eventName}
                  </Typography>
                  <Typography variant="body2">
                    {event.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}