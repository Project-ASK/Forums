import * as React from 'react';
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import Typewriter from 'typewriter-effect'; // Import Typewriter
import Image from 'next/image';

export default function Hero() {

  const [images, setImages] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/images`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setImages(data))
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        setError(error.message);
      });
  }, []);

  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        backgroundImage:
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
            : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
        backgroundSize: '100% 20%',
        backgroundRepeat: 'no-repeat',
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack spacing={2} useFlexGap sx={{ width: { xs: '100%', sm: '70%' }, paddingBottom: error ? 0 : '4rem' }}>
          <Typography
            component="h1"
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignSelf: 'center',
              textAlign: 'center',
            }}
          >
            Welcome to&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light' ? 'primary.main' : 'primary.light',
              }}
            >
              <Typewriter
                options={{
                  strings: ['Forums CEC'],
                  autoStart: true,
                  loop: true,
                }}
              />
            </Typography>
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.primary">
            <q style={{ fontStyle: 'italic', fontSize: "1rem" }}>
              Empowering college communities through intuitive event management tools and top-tier services at Forums CEC.
            </q>
          </Typography>
        </Stack>
        {error ? (
          <Box
            id="image"
            sx={(theme) => ({
              mt: { xs: 8, sm: 10 },
              alignSelf: 'center',
              height: { xs: 200, sm: 700 },
              width: '100%',
              borderRadius: '10px',
              outline: '1px solid',
              outlineColor:
                theme.palette.mode === 'light'
                  ? alpha('#BFCCD9', 0.5)
                  : alpha('#9CCCFC', 0.1),
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 12px 8px ${alpha('#9CCCFC', 0.2)}`
                  : `0 0 24px 12px ${alpha('#033363', 0.2)}`,
            })}
          />
        ) : (
          <Carousel autoPlay infiniteLoop showThumbs={false} emulateTouch={true} preventMovementUntilSwipeScrollTolerance={true} showStatus={false}>
            {images.map((image, index) => (
              <div key={index}>
                <Image 
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/guest/${image}`} 
                  alt="image"
                  width={120}
                  height={120}
                  layout="responsive"
                />
              </div>
            ))}
          </Carousel>
        )}
      </Container>
    </Box>
  );
}
