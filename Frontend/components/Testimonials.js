import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';

const userTestimonials = [
  {
    avatar: <Avatar alt="John Smith" />,
    name: "John Smith",
    occupation: 'GDSC Lead',
    testimonial:
      "Forums CEC has revolutionized event management for our college community. Its adaptability and intuitive design have made organizing and participating in events a breeze. I'm impressed by how it seamlessly caters to the diverse needs of students, community leaders, and administrators.",
  },
  {
    avatar: <Avatar alt="Emily Johnson" />,
    name: 'Emily Johnson',
    occupation: 'IEEE Chair',
    testimonial:
      "I've been thoroughly impressed by the Forums CEC team's commitment to customer support. Their responsiveness and assistance have been invaluable in ensuring the success of our events. It's reassuring to have such reliable support behind us.",
  },
  {
    avatar: <Avatar alt="Cindy Baker" />,
    name: 'Cindy Baker',
    occupation: 'IEDC Lead',
    testimonial:
      'Forums CEC has simplified event management for me in ways I never thought possible. Its user-friendly interface and seamless functionality have made my role as a community leader significantly easier. I highly recommend it to anyone looking to streamline their event planning process.',
  },
  {
    avatar: <Avatar alt="Michael Brown" />,
    name: 'Michael Brown',
    occupation: 'FOCES Lead',
    testimonial:
      "The attention to detail in Forums CEC is truly remarkable. Every feature is thoughtfully designed to enhance the event management experience. It's evident that the creators have a deep understanding of the needs of college communities.",
  },
  {
    avatar: <Avatar alt="Jessica Miller" />,
    name: 'Jessica Miller',
    occupation: 'TinkerHub Lead',
    testimonial:
      "As a leader of a college community, I've found Forums CEC to be a game-changer. Its innovative features have enabled us to take our events to the next level. The platform's versatility and reliability make it a standout choice for event management.",
  },
  {
    avatar: <Avatar alt="David Wilson" />,
    name: 'David Wilson',
    occupation: 'Mulearn Lead',
    testimonial:
      "Forums CEC has exceeded my expectations in every way. Its quality and durability are unmatched, making it the perfect solution for our college's event management needs. I'm confident in its ability to support us for years to come.",
  },
];

const whiteLogos = [
  '/assets/forums/GDSC.jpg',
  '/assets/forums/IEEE.jpg',
  '/assets/forums/IEDC.jpg',
  '/assets/forums/FOCES.jpg',
  '/assets/forums/TINKERHUB.jpg',
  '/assets/forums/MULEARN.jpg',
];

const darkLogos = [
  '/assets/forums/GDSC.jpg',
  '/assets/forums/IEEE.jpg',
  '/assets/forums/IEDC.jpg',
  '/assets/forums/FOCES.jpg',
  '/assets/forums/TINKERHUB.jpg',
  '/assets/forums/MULEARN.jpg',
];

const logoStyle = {
  width: '64px',
  height: "64px",
  opacity: 0.8,
};

export default function Testimonials() {
  const theme = useTheme();
  const logos = theme.palette.mode === 'light' ? darkLogos : whiteLogos;

  return (
    <Container
      id="testimonials"
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
      <Box
        sx={{
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        <Typography component="h2" variant="h4" color="text.primary">
          Testimonials
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hear what our Forums CEC users have to say. Experience our commitment to efficiency,
          durability, and satisfaction. Join our community for quality, innovation, and reliable support.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexGrow: 1,
                p: 1,
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  pr: 2,
                }}
              >
                <CardHeader
                  avatar={<Avatar alt={testimonial.name.split(' ')[0]}>{testimonial.name.split(' ')[0][0]}</Avatar>}
                  title={testimonial.name}
                  subheader={testimonial.occupation}
                />
                <img
                  src={logos[index]}
                  alt={`Logo ${index + 1}`}
                  style={logoStyle}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
