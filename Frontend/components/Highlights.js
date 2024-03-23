import * as React from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import AlarmIcon from '@mui/icons-material/Alarm';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Carousel from 'react-material-ui-carousel'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from 'swiper/modules';
import "swiper/css";
import 'swiper/css/navigation';
import 'swiper/css/autoplay';


export default function Highlights() {
  const [events, setEvents] = React.useState([]);
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [open, isOpen] = React.useState(false);
  const router = useRouter();
  let touchTimer;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleTouchStart = () => {
    touchTimer = setTimeout(() => {
      isOpen(true);
    }, 500); // Trigger action after 5 seconds
  };

  const sliderSettings = {
    slidesPerView: 3,
    slidesPerGroup: 3, // Add this line
    spaceBetween: 100,
    breakpoints: {
      480: {
        slidesPerView: 1,
        slidesPerGroup: 1, // Add this line
      },
      600: {
        slidesPerView: 2,
        slidesPerGroup: 2, // Add this line
      },
      750: {
        slidesPerView: 3,
        slidesPerGroup: 3, // Add this line
      },
      1100: {
        slidesPerView: 3,
        slidesPerGroup: 3, // Add this line
      },
    },
  };


  const handleTouchEnd = () => {
    clearTimeout(touchTimer);
  };

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
      }
    };
    handleResize(); // Call once to set initial value
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    const fetchAllEvents = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllEvents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const currentEvents = data.events.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(currentEvents);
    }
    fetchAllEvents();
  }, []);

  const handleClose = () => {
    isOpen(false);
  }

  const redirectLogin = () => {
    router.push('/auth/login');
  }

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
        {isSmallScreen ? (
          <Carousel className="w-[90%]">
            {events.map((event) => (
              <Stack
                direction="column"
                color="inherit"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  p: 2,
                  height: '100%',
                  width: "90%",
                  border: '3px solid',
                  borderColor: '#4287f5',
                  background: 'transparent',
                  backgroundColor: 'grey.400',
                  margin: "auto"
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => handleImageClick(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.imagePath}`)}
              >
                <Box sx={{ opacity: '100%' }}>
                  <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.imagePath}`} alt="event-image" className="object-cover w-full h-72 rounded-lg" />
                  {new Date(event.date) > today && (
                    <div className="absolute top-1 left-5 bg-blue-600 text-white px-2 py-1 font-bold text-sm rounded-full">
                      New
                    </div>
                  )}
                </Box>
                <div>
                  <Typography fontWeight="medium" gutterBottom>
                    {event.eventName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'nowrap', // Apply whiteSpace property
                      overflow: 'hidden', // Apply overflow property
                      textOverflow: 'ellipsis', // Apply textOverflow property
                    }}
                  >
                    {event.description}
                  </Typography>
                </div>
              </Stack>
            ))}
          </Carousel>
        ) : (
          // <Grid container spacing={2.5}>
          <Swiper {...sliderSettings} className="w-[100%] mx-auto"
            modules={[Navigation, Autoplay]}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            autoplay={{ delay: 2000 }}
            disableOnInteraction={true}
          >
            {events.map((event, index) => (
              <SwiperSlide key={index}>
                {/* <Grid item xs={12} sm={6} md={4} key={index}> */}
                <Stack
                  direction="column"
                  color="inherit"
                  component={Card}
                  spacing={1}
                  useFlexGap
                  sx={{
                    p: 2,
                    height: '100%',
                    width: "90%",
                    border: '3px solid',
                    borderColor: '#4287f5',
                    background: 'transparent',
                    backgroundColor: 'grey.400',
                    margin: "auto"
                  }}
                >
                  <Box sx={{ opacity: '100%' }}>
                    <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.imagePath}`} alt="event-image" className="object-cover w-full h-72 rounded-lg" onClick={() => handleImageClick(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.imagePath}`)} />
                    {new Date(event.date) > today && (
                      <div className="absolute top-1 left-5 bg-blue-600 text-white px-2 py-1 font-bold text-sm rounded-full">
                        New
                      </div>
                    )}
                  </Box>
                  <div>
                    <Typography fontWeight="medium" gutterBottom className="text-xl">
                      {event.eventName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'nowrap', // Apply whiteSpace property
                        overflow: 'hidden', // Apply overflow property
                        textOverflow: 'ellipsis', // Apply textOverflow property
                      }}
                    >
                      {event.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        sx={{
                          mt: 2, // Adjust margin-top for spacing
                          alignSelf: 'center', // Align button to the center
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#90caf9' : '#2196f3'), // Adjust background color based on theme mode
                          color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'), // Adjust text color based on theme mode
                          '&:hover': {
                            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#64b5f6' : '#1976d2'), // Adjust hover background color based on theme mode
                          },
                        }}
                        endIcon={<AlarmIcon />}
                        onClick={() => { isOpen(true) }}
                      >
                        Join Event
                      </Button>
                    </Box>
                  </div>
                </Stack>
              </SwiperSlide>
            ))}
            <div className="swiper-button-prev" style={{ color: 'blue', paddingRight: "20px" }}></div>
            <div className="swiper-button-next" style={{ color: '#03fc2c', paddingLeft: "20px" }}></div>
          </Swiper>
        )}
      </Container>
      {selectedImage && (
        <Box
          sx={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={handleCloseModal}
        >
          <img src={selectedImage} alt="selected-event-image" style={{
            maxHeight: isSmallScreen ? '80vh' : '60%',
            maxWidth: isSmallScreen ? '80vw' : '60%',
            borderRadius: '2%',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          }} />
        </Box>
      )}
      {open && (
        <Dialog
          open={open}
          // TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{"Are you a CEC Student?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              If you are a CEC student, please proceed with event registration using your student account, or continue as a guest to register for the event.          </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} className="hover:bg-red-200">No</Button>
            <Button onClick={redirectLogin} className="hover:bg-green-200">Yes</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}