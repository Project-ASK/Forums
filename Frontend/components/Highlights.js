import * as React from 'react';
import Modal from 'react-modal';
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
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from 'swiper/modules';
import emailjs from '@emailjs/browser';
import "swiper/css";
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Highlights() {
  const [events, setEvents] = React.useState([]);
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [open, isOpen] = React.useState(false);
  const [isGuestDialog, setIsGuestDialog] = React.useState(false);
  const router = useRouter();
  let touchTimer;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [college, setCollege] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState('');
  const [showOtpField, setShowOtpField] = React.useState(false);
  const [eventName, setEventName] = React.useState('');
  const [eventId, setEventId] = React.useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);
    setOtpSent(generatedOtp.toString());
    emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID1, process.env.NEXT_PUBLIC_TEMPLATE_ID1, { email, otp: generatedOtp.toString() }, process.env.NEXT_PUBLIC_PUBLIC_KEY1)
      .then((result) => {
        console.log(result.text);
        setShowOtpField(true);
      }, (error) => {
        console.log(error.text);
      });
  };

  const verifyOtp = () => {
    if (otp === otpSent) {
      setShowOtpField(false);
      toast.success('OTP verified successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      toast.error('Incorrect OTP. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };


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

  const handleGuestReg = () => {
    isOpen(false);
    setIsGuestDialog(true);
  }

  const handleCloseGuestReg = () => {
    setIsGuestDialog(false);
  }

  const handleClose = () => {
    isOpen(false);
  }

  const redirectLogin = () => {
    router.push('/auth/login');
  }

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/guest/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          college,
          eventName,
          eventId
        }),
      });

      if (response.ok) {
        console.log('Guest registered successfully');
        setIsGuestDialog(false);
      } else {
        console.error('Error registering guest:', response.statusText);
      }
    } catch (error) {
      console.error('Error registering guest:', error);
    }
  };

  return (
    <>
      <ToastContainer />
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
                          onClick={() => {
                            setEventName(event.eventName);
                            setEventId(event._id);
                            isOpen(true);
                          }}
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
              <Button onClick={handleGuestReg} className="hover:bg-red-200">No</Button>
              <Button onClick={redirectLogin} className="hover:bg-green-200">Yes</Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
      {
        isGuestDialog && (
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full">
            <div className="p-4 max-w-xl mx-auto relative left-0 right-0 overflow-hidden mt-24">
              <div className="shadow  rounded-lg bg-white overflow-hidden w-full block p-8">
                <h2 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">Join Event</h2>
                <div className="mb-4">
                  <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Name</label>
                  <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Email</label>
                  <Stack direction="row" spacing={2} className='mt-2'>
                    <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <button className="bg-blue-200 rounded-lg w-[20%] cursor-pointer p-1.3" onClick={sendEmail}>
                      Send OTP
                    </button>
                  </Stack>
                </div>
                {showOtpField && (
                  <>
                    <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">OTP</label>
                    <Stack direction="row" spacing={2} className='mt-2'>
                      <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
                      <button className="bg-green-200 rounded-lg w-[20%] cursor-pointer p-1.3" onClick={verifyOtp}>
                        Verify
                      </button>
                    </Stack>
                  </>
                )}
                <div className="mb-4 mt-2">
                  <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Phone</label>
                  <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">College</label>
                  <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={college} onChange={(e) => setCollege(e.target.value)} />
                </div>
                <div className="mt-8 text-right">
                  <button type="button" className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm mr-2" onClick={handleCloseGuestReg}>
                    Cancel
                  </button>
                  <button type="button" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 border border-gray-700 rounded-lg shadow-sm" onClick={handleJoinEvent}>
                    Join Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}