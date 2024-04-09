import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Carousel from 'react-material-ui-carousel'
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Grid } from '@mui/material';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from 'swiper/modules';
import "swiper/css";
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Link } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const Dashboard = ({ username, pay }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [forums, setForums] = useState([]);
    const [greeting, setGreeting] = useState('');
    const [attendedEventsCount, setAttendedEventsCount] = useState(0);
    const [numForums, setNumForums] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState('');
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [events, setEvents] = useState([]);
    const [name, setName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const node = useRef();
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [no_of_days, setNo_of_days] = useState([]);
    const [blankdays, setBlankdays] = useState([]);
    const [calevents, setCalEvents] = useState([]);
    const [event_title, setEvent_title] = useState('');
    const [event_date, setEvent_date] = useState('');
    const [event_theme, setEvent_theme] = useState('blue');
    const [openEventModal, setOpenEventModal] = useState(false);
    const [joinEventModal, setJoinEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [containerWidth, setContainerWidth] = useState('100%'); // Initial width is 100%
    const [showScrollbar, setShowScrollbar] = useState(false); // Flag to show/hide scrollbar
    const requestAbortController = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [highlightedDays, setHighlightedDays] = React.useState([]);
    const [recommendedEvents, setRecommendedEvents] = useState([]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [posts, setPosts] = useState([]);
    const [isFeedback, setIsFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [paymentError, setPaymentError] = useState(null);

    const nodeNotifications = useRef(); // Create a new useRef for notifications

    const handleClickOutsideNotifications = e => { // Define handleClickOutsideNotifications function
        if (nodeNotifications.current.contains(e.target)) {
            // inside click
            return;
        }
        // outside click 
        setIsOpen(false);
    };

    useEffect(() => { // Add useEffect for notifications
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutsideNotifications);
        } else {
            document.removeEventListener("mousedown", handleClickOutsideNotifications);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideNotifications);
        };
    }, [isOpen]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fetchPosts`);
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        const fetchRecommendedEvents = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/eventJson/${username}_events.json`);
            const data = await response.json();
            if (data) {
                setRecommendedEvents(data);
            }
        };
        // Call the function once immediately
        fetchRecommendedEvents();
    }, [username]);

    useEffect(() => {
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

    const sliderSettings = {
        slidesPerView: 4,
        slidesPerGroup: 4, // Add this line
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
                slidesPerView: 4,
                slidesPerGroup: 4, // Add this line
            },
        },
    };

    useEffect(() => {
        const numCards = forums.length;
        const cardWidth = isSmallScreen ? 100 / numCards : 100 / numCards; // in percentage
        const totalWidth = numCards * cardWidth;
        setContainerWidth(`${totalWidth}%`);
        setShowScrollbar(true);
    }, [forums, isSmallScreen]);

    useEffect(() => {
        getNoOfDays();
        setGreeting(getGreeting());
    }, [month, year]);

    const toggleShowFullDescription = (index) => {
        if (forums[index].description.length > 46) {
            setShowFullDescription({
                ...showFullDescription,
                [index]: !showFullDescription[index]
            });
        }
    };

    const handleClickOutside = e => {
        if (node.current.contains(e.target)) {
            return;
        }
        setDropdownVisible(false);
    };

    useEffect(() => {
        if (dropdownVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownVisible]);

    const fetchQuestions = (event) => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getQuestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventName: event.eventName,
                forumName: event.forumName,
            }),
        })
            .then(response => response.json())
            .then(data => {
                // Set the questions state with the fetched questions
                setQuestions(data.questions);
            });
    };

    function joinEvent() {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/joinEvent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                event: selectedEvent.eventName,
                forumName: selectedEvent.forumName,
                questions: selectedEvent.questions,
                responses
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success('Successfully joined the event', {
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
                    setCalEvents([...calevents, {
                        event_date: selectedEvent.date,
                        event_title: selectedEvent.eventName,
                        event_theme: event_theme
                    }]);
                    setJoinedEvents([...joinedEvents, selectedEvent.eventName]);

                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addCustomEvent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username,
                            event: {
                                event_date: selectedEvent.date,
                                event_title: selectedEvent.eventName,
                                event_theme: event_theme
                            }
                        }),
                    })
                        .then(response => response.json())
                        .then(data => { });
                } else {
                    toast.error('Failed to join the event', {
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
            });
        setJoinEventModal(false);
        setQuestions([]);
    }

    function getNoOfDays() {
        let daysInMonth = new Date(year, month + 1, 0).getDate();

        // find where to start calendar day of week
        let dayOfWeek = new Date(year, month).getDay();
        let blankdaysArray = [];
        for (var i = 1; i <= dayOfWeek; i++) {
            blankdaysArray.push(i);
        }

        let daysArray = [];
        for (var i = 1; i <= daysInMonth; i++) {
            daysArray.push(i);
        }

        setBlankdays(blankdaysArray);
        setNo_of_days(daysArray);
    }

    function isToday(date) {
        const today = new Date();
        const d = new Date(year, month, date);

        return today.toDateString() === d.toDateString() ? true : false;
    }

    function showEventModal(date) {
        setOpenEventModal(true);
        setEvent_date(new Date(year, month, date).toDateString());
    }

    function addEvent() {
        if (event_title == '') {
            return;
        }

        // Add this
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addCustomEvent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username, event: {
                    event_date: event_date,
                    event_title: event_title,
                    event_theme: event_theme
                }
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success('Event added successfully', {
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
                    setCalEvents([...calevents, {
                        event_date: event_date,
                        event_title: event_title,
                        event_theme: event_theme
                    }]);
                } else {
                    toast.error('Failed to add event', {
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
            });

        // clear the form data
        setEvent_title('');
        setEvent_date('');
        setEvent_theme('blue');

        //close the modal
        setOpenEventModal(false);
    }

    useEffect(() => {
        const fetchForums = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getForums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });
            const data = await response.json();
            setForums(data.forums);
            setName(data.name);
            setEmail(data.email);
            setNumForums(data.forums.length);

            // Call fetchEvents here after forums data is set
            fetchEvents(data.forums);
            setCalEvents(data.customEvents);
        };

        const fetchEvents = async (forums) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getEvents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ forums: forums.map(forum => forum.name) }),
            });

            const data = await response.json();
            // let currentEvents = data.events.filter(event => new Date(event.date) >= new Date());
            let currentEvents = data.events.sort((a, b) => new Date(b.date) - new Date(a.date));
            setEvents(currentEvents);
        }

        const fetchJoinedEvents = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getJoinedEvents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();
            setJoinedEvents(data.joinedEvents);
            const attendedCount = data.joinedEvents.reduce((count, event) => event.isAttended ? count + 1 : count, 0);
            setAttendedEventsCount(attendedCount);
        }

        fetchForums();
        fetchJoinedEvents();
    }, [username]);

    useEffect(() => {
        if (name) {
            toast(`Welcome ${name}`, {
                position: "top-center",
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
    }, [name])

    const organizations = ['PRODDEC', 'IEEE', 'NSS', 'NCC', 'TINKERHUB'];

    const handleModalOpen = () => {
        setModalIsOpen(true);
    }

    const handleModalClose = () => {
        setModalIsOpen(false);
    }

    const handleOrgSelect = (event) => {
        setSelectedOrg(event.target.value);
    }

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    }

    const handleSubmit = () => {
        handleModalClose();
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addForum`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, org: selectedOrg, id: inputValue }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success('Success', {
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
                    handleModalClose();
                } else {
                    toast.error('Failed', {
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
            });
    }

    function deleteEvent(event) {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteCustomEvent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username, event
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success('Event deleted successfully', {
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
                    setCalEvents(calevents.filter(e => !(e.event_date === event.event_date && e.event_title === event.event_title)));
                } else {
                    toast.error('Failed to delete event', {
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
            });
    }

    const handleLogout = () => {
        // Clear the cookies and redirect the user to the login page
        Cookies.remove('username');
        Cookies.remove('token');
        router.replace('/auth/login');
    }

    const handleProfileEdit = () => {
        // Add your profile editing logic here
        router.push('/user/editProfile');
    }

    function getGreeting() {
        const hours = new Date().getHours();
        if (hours < 12) {
            return 'Good Morning';
        } else if (hours < 18) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    }

    function ServerDay(props) {
        const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

        const isSelected =
            !props.outsideCurrentMonth && highlightedDays.includes(day.format('YYYY-MM-DD'));

        return (
            <Badge
                key={props.day.toString()}
                overlap="circular"
                badgeContent={isSelected ? '✅' : undefined}
            >
                <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
            </Badge>
        );
    }

    const fetchHighlightedDays = async (date) => {
        const controller = new AbortController();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getForums`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
            signal: controller.signal,
        });
        const data = await response.json();
        const daysToHighlight = data.customEvents.map(event => event.event_date);
        setHighlightedDays(daysToHighlight);
        setIsLoading(false);
        requestAbortController.current = controller;
    };

    useEffect(() => {
        fetchHighlightedDays(dayjs(new Date()));
        return () => requestAbortController.current?.abort();
    }, []);

    const handleMonthChange = (date) => {
        if (requestAbortController.current) {
            requestAbortController.current.abort();
        }
        setIsLoading(true);
        setHighlightedDays([]);
        fetchHighlightedDays(date);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        const formattedDate = dayjs(date).format('YYYY-MM-DD');

        // Find the event for the selected date
        const event = calevents.find(e => e.event_date === formattedDate);

        // If an event exists for the selected date, delete it
        if (event) {
            deleteEvent(event);
        } else {
            // If no event exists for the selected date, open the modal
            setEvent_date(formattedDate); // Set the event_date state to the formatted date
            setOpenEventModal(true); // Open the modal
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    // Function to handle changes in the search input field
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Filter the members array based on the search query
    const filteredEvents = events.filter((event) =>
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If username is not available, don't render anything
    if (!username) {
        return null;
    }

    const handleFeedbackDialog = () => {
        setIsFeedback(true);
    }

    const handleCloseFeedback = () => {
        setIsFeedback(false);
    }

    const handleSubmitFeedback = async (eventId, feedback) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/submitFeedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, eventId, feedback }),
        });
        if (response.ok) {
            setIsFeedback(false);
            setFeedback('');
            toast.success('Feedback submitted successfully', {
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
    }

    const paymentCheckOut = async () => {
        try {
            // Fetch checkout session from server
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: selectedEvent.amount,
                    eventName: selectedEvent.eventName
                })
            });

            const { sessionId } = await response.json();
            Cookies.set('sessionId', sessionId);
            Cookies.set('eventDetails', JSON.stringify({
                eventName: selectedEvent.eventName,
                forumName: selectedEvent.forumName,
                questions: selectedEvent.questions,
                responses
            }));

            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId
            });

            if (error) {
                console.error('Payment failed:', error);
                setPaymentError('Payment failed. Please try again.');
            } else {
                console.log('Payment succeeded!');
            }
        } catch (error) {
            console.error('Error:', error);
            setPaymentError('An error occurred. Please try again later.');
        }
    };

    const [sessionId, setSessionId] = useState(Cookies.get('sessionId'));
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            if (sessionId && !hasJoined) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/check-payment-status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            sessionId
                        })
                    });

                    const { paymentStatus } = await response.json();

                    if (paymentStatus === 'paid') {
                        const eventDetails = JSON.parse(Cookies.get('eventDetails'));
                        joinPaidEvent(eventDetails);
                        setHasJoined(true);
                        const urlWithoutSessionId = window.location.pathname;
                        router.replace(urlWithoutSessionId, undefined, { shallow: true });
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        };

        checkPaymentStatus();
    }, [sessionId, hasJoined]);

    function joinPaidEvent(eventDetails) {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/joinEvent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                event: eventDetails.eventName,
                forumName: eventDetails.forumName,
                questions: eventDetails.questions,
                responses: eventDetails.responses
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Cookies.remove('sessionId');
                    Cookies.remove('eventDetails');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    return (
        <>
            <ToastContainer />
            <div className="flex bg-white w-full shadow-lg justify-between items-center rounded-lg">
                <img src="/assets/logo.png" width={160} />
                <div className="relative flex items-center">
                    <img src="/assets/notification.png" width={20} onClick={() => setIsOpen(!isOpen)} className="relative right-[2rem] cursor-pointer" />
                    {isOpen && (
                        <div ref={nodeNotifications} className="absolute right-[6rem] top-[3rem] py-2 bg-white border rounded shadow-xl overflow-y-auto max-h-64 z-30 w-[130%]">
                            {/* Map over posts and render each post as a notification */}
                            {posts.map(post => (
                                <div key={post._id}>
                                    {post.messages.map(message => (
                                        <>
                                            <p key={message._id} className="transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 font-semibold rounded hover:bg-purple-500 hover:text-white mb-1">
                                                {message.message}
                                                <br />
                                                <p className="text-gray-500 font-light text-sm hover:text-white">{message.timestamp}</p>
                                            </p>
                                        </>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="relative right-[1rem] font-product-sans font-semibold">{name}</p>
                    <img
                        src="/assets/profile.svg" width={40}
                        className="self-center mr-[2rem] cursor-pointer"
                        onClick={() => setDropdownVisible(!dropdownVisible)} // Toggle the dropdown when the image is clicked
                    />
                    {dropdownVisible && ( // Only show the dropdown if dropdownVisible is true
                        <div ref={node} className="absolute mt-36 right-2 w-48 bg-white border border-gray-200 rounded-lg py-2 shadow-xl z-50">
                            <button
                                onClick={handleProfileEdit}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white w-full text-left rounded-md"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white w-full text-left rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className={`relative top-[2rem] mb-[8rem] ${isSmallScreen ? 'text-center mx-auto' : 'ml-[5rem]'}`}>
                <h2 className="font-product-sans text-xl">{greeting},<span className="font-product-sans font-bold text-xl"> {name}</span></h2>
            </div>
            <div className="flex justify-center mt-[4rem] flex-wrap">
                <div className="flex flex-col items-center justify-center w-80 bg-gray-200 shadow-md rounded-lg mx-2 xs:mb-[2rem] lg:mb-0 border-[5px] border-l-green-400">
                    <img src="/assets/events.png" alt="Image" className="w-20 h-20 mt-4 mb-2" />
                    <div className="p-4 text-center">
                        <h2 className="font-product-sans font-bold text-xl">No of Events Joined</h2>
                        <p className="font-product-sans text-xl">{joinedEvents.length}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center w-80 bg-gray-200 shadow-md rounded-lg mx-2 xs:mb-[2rem] lg:mb-0 border-[5px] border-l-red-400">
                    <img src="/assets/attendance.png" alt="Image" className="w-20 h-20 mt-4 mb-2" />
                    <div className="p-4 text-center">
                        <h2 className="font-product-sans font-bold text-xl">No of Events Participated</h2>
                        <p className="font-product-sans text-xl">{attendedEventsCount}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center w-80 bg-gray-200 shadow-md rounded-lg mx-2 border-[5px] border-l-blue-400">
                    <img src="/assets/forumCount.png" alt="Image" className="w-20 h-20 mt-4 mb-2" />
                    <div className="p-4 text-center">
                        <h2 className="font-product-sans font-bold text-xl">No of Active Forums</h2>
                        <p className="font-product-sans text-xl">{numForums}</p>
                    </div>
                </div>
            </div>
            <div className={`relative top-[6rem] pt-[4rem] ${isSmallScreen ? 'text-center mx-auto' : 'ml-[5rem]'}`}>
                <h2 className="font-product-sans font-semibold text-2xl relative top-12">Events</h2>
                <div className="relative top-12 pb-3 flex justify-center">
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-500"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="table-search"
                            className="block pt-3 pb-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search for events"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-center items-center h-screen shadow-lg rounded-lg bg-blue-100 mt-[2rem] w-[96%] mx-auto">
                {isSmallScreen ? (
                    <Carousel className="w-full h-[70%]" indicatorContainerProps={{ style: { display: 'none' } }}>
                        {filteredEvents.map((event, index) => (
                            <Grid container spacing={15} className="justify-center items-center" key={index}>
                                <Grid item xs={9.5} md={3} >
                                    <div className="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-72 mt-[20px]">
                                        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-72">
                                            <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.eventImagePath}`} alt="card-image" className="object-cover w-full h-full" />
                                            {recommendedEvents.some(recommendedEvent => recommendedEvent.eventName === event.eventName) && (
                                                <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 font-bold text-sm rounded-full">
                                                    Recommended
                                                </div>
                                            )}
                                            {new Date(event.date) > today && (
                                                <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 font-bold text-sm rounded-full">
                                                    New
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="block font-bold text-xl">{event.eventName}</p>
                                            </div>
                                            <div className="flex items-center space-x-5 mb-2">
                                                <div className="flex p-2 text-sm text-white font-bold items-center justify-center space-x-2 bg-red-300 rounded-xl">
                                                    <img src="/assets/queue.png" height={20} width={20} />
                                                    <p>{event.forumName}</p>
                                                </div>
                                                <div className="flex p-2 text-sm text-white font-bold items-center justify-center space-x-2 bg-amber-200 rounded-xl">
                                                    <img src="/assets/time.png" height={20} width={22} />
                                                    <p className="text-zinc-600">{event.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex p-2 text-xs text-white font-bold justify-between items-center bg-emerald-300 rounded-xl">
                                                <img src="/assets/pin.png" height={20} width={20} />
                                                <p>{event.location}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 pt-0">
                                            {joinedEvents.find(joinedEvent => joinedEvent.eventName === event.eventName && joinedEvent.isAttended) ? (
                                                <>
                                                    <p className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-orange-200 cursor-not-allowed" onClick={handleFeedbackDialog}>
                                                        Submit Feedback
                                                    </p>
                                                    {isFeedback && (
                                                        <Dialog open={isFeedback} onClose={handleCloseFeedback}>
                                                            <DialogTitle>Feedback Form</DialogTitle>
                                                            <DialogContent>
                                                                {event.certificateLink && (
                                                                    <Typography component="h6" variant="h7">
                                                                        Certificate Link:&nbsp;
                                                                        <Link href={event.certificateLink} variant="body2">
                                                                            {event.certificateLink}
                                                                        </Link>
                                                                    </Typography>
                                                                )}
                                                                <TextField
                                                                    label="Feedback"
                                                                    fullWidth
                                                                    value={feedback}
                                                                    onChange={(e) => setFeedback(e.target.value)}
                                                                    margin="normal"
                                                                    variant="outlined"
                                                                />
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button onClick={handleCloseFeedback} color="primary">
                                                                    Cancel
                                                                </Button>
                                                                <Button onClick={() => handleSubmitFeedback(event._id, feedback)}>
                                                                    Submit
                                                                </Button>
                                                            </DialogActions>
                                                        </Dialog>
                                                    )}
                                                </>
                                            ) : new Date(event.date) < today ? (
                                                <p className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-gray-100 hover:bg-red-200 cursor-not-allowed">
                                                    Ended
                                                </p>
                                            ) : (
                                                joinedEvents.find(joinedEvent => joinedEvent.eventName === event.eventName) ? (
                                                    <p className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-green-100 hover:bg-green-200">
                                                        Already Joined
                                                    </p>
                                                ) : (
                                                    <button
                                                        className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-gray-100 hover:bg-green-100"
                                                        type="button" onClick={() => { setSelectedEvent(event); fetchQuestions(event); setJoinEventModal(true); }}>
                                                        Join Event
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        ))
                        }
                    </Carousel>
                ) : (
                    <>
                        <Swiper {...sliderSettings} className="w-[90%] mx-auto"
                            modules={[Navigation, Autoplay]}
                            navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            }}
                            autoplay={{ delay: 2000 }}
                        >
                            {filteredEvents.map((event, index) => (
                                <SwiperSlide key={index}>
                                    <div className="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-72 h-[90%] overflow-auto mt-[20px]">
                                        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-72">
                                            <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.eventImagePath}`} alt="card-image" className="object-cover w-full h-full" />
                                            {recommendedEvents.some(recommendedEvent => recommendedEvent.eventName === event.eventName) && (
                                                <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 font-bold text-sm rounded-full">
                                                    Recommended
                                                </div>
                                            )}
                                            {new Date(event.date) > today && (
                                                <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 font-bold text-sm rounded-full">
                                                    New
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="block font-bold text-xl">{event.eventName}</p>
                                            </div>
                                            <div className="flex items-center space-x-5 mb-2">
                                                <div className="flex p-2 text-sm text-white font-bold items-center justify-center space-x-2 bg-red-300 rounded-xl">
                                                    <img src="/assets/queue.png" height={20} width={20} />
                                                    <p>{event.forumName}</p>
                                                </div>
                                                <div className="flex p-2 text-sm text-white font-bold items-center justify-center space-x-2 bg-amber-200 rounded-xl">
                                                    <img src="/assets/time.png" height={20} width={22} />
                                                    <p className="text-zinc-600">{event.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex p-2 text-xs text-white font-bold justify-between items-center bg-emerald-300 rounded-xl">
                                                <img src="/assets/pin.png" height={20} width={20} />
                                                <p>{event.location}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 pt-0">
                                            {joinedEvents.find(joinedEvent => joinedEvent.eventName === event.eventName && joinedEvent.isAttended) ? (
                                                <>
                                                    <p className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-orange-200 cursor-pointer" onClick={handleFeedbackDialog}>
                                                        {/* Participated */}
                                                        Sumbit Feedback
                                                    </p>
                                                    {isFeedback && (
                                                        <Dialog open={isFeedback} onClose={handleCloseFeedback}>
                                                            <DialogTitle>Feedback Form</DialogTitle>
                                                            <DialogContent>
                                                                {event.certificateLink && (
                                                                    <Typography component="h6" variant="h7">
                                                                        Certificate Link:&nbsp;
                                                                        <Link href={event.certificateLink} variant="body2">
                                                                            {event.certificateLink}
                                                                        </Link>
                                                                    </Typography>
                                                                )}
                                                                <TextField
                                                                    label="Feedback"
                                                                    fullWidth
                                                                    value={feedback}
                                                                    onChange={(e) => setFeedback(e.target.value)}
                                                                    margin="normal"
                                                                    variant="outlined"
                                                                />
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button onClick={handleCloseFeedback} color="primary">
                                                                    Cancel
                                                                </Button>
                                                                <Button onClick={() => handleSubmitFeedback(event._id, feedback)}>
                                                                    Submit
                                                                </Button>
                                                            </DialogActions>
                                                        </Dialog>
                                                    )}
                                                </>
                                            ) :
                                                new Date(event.date) < today ? (
                                                    <p className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-gray-100 hover:hover:bg-red-200 cursor-not-allowed">
                                                        Ended
                                                    </p>
                                                ) : (
                                                    joinedEvents.find(joinedEvent => joinedEvent.eventName === event.eventName) ? (
                                                        <p className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-green-100 hover:bg-green-200">
                                                            Already Joined
                                                        </p>
                                                    ) : (
                                                        <button
                                                            className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100 bg-gray-100 hover:bg-green-100"
                                                            type="button" onClick={() => { setSelectedEvent(event); fetchQuestions(event); setJoinEventModal(true); }}>
                                                            Join Event
                                                        </button>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                            <div className="swiper-button-prev" style={{ color: 'blue', paddingRight: "20px" }}></div>
                            <div className="swiper-button-next" style={{ color: 'blue', paddingLeft: "20px" }}></div>
                        </Swiper>
                    </>
                )}
            </div>
            {joinEventModal &&
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full">
                    <div className="p-4 max-w-xl mx-auto relative left-0 right-0 overflow-hidden mt-24">
                        <div className="shadow rounded-lg bg-white overflow-hidden w-full block p-8">
                            <h2 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">Join {selectedEvent?.eventName}</h2>
                            <div className="mb-4">
                                {questions.length != 0 && (
                                    <>
                                        <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Questions</label>
                                        {questions.map((question, index) => (
                                            <div key={index}>
                                                <p>{question.question}</p>
                                                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 mt-[0.8rem]" type={question.type} onChange={(e) => setResponses({ ...responses, [question.question]: e.target.value })} />
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                            <div className="inline-block w-64 mb-4">
                                <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Select a theme</label>
                                <div className="relative">
                                    <select value={event_theme} onChange={(e) => setEvent_theme(e.target.value)} className="block appearance-none w-full bg-gray-200 border-2 border-gray-200 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-gray-700">
                                        <option value="blue">Blue Theme</option>
                                        <option value="red">Red Theme</option>
                                        <option value="yellow">Yellow Theme</option>
                                        <option value="green">Green Theme</option>
                                        <option value="purple">Purple Theme</option>
                                    </select>
                                </div>
                                {selectedEvent.amount > 0 && (
                                    <div className="mt-4">
                                        <p className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Amount</p>
                                        <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" value={selectedEvent.amount} readOnly />
                                    </div>
                                )}
                            </div>
                            <div className="mt-8 text-right">
                                <button type="button" className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm mr-2" onClick={() => { setJoinEventModal(false); setQuestions([]); }}>
                                    Cancel
                                </button>
                                <button type="button" className={`bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 border border-gray-700 rounded-lg shadow-sm`} onClick={() => selectedEvent.amount > 0 ? paymentCheckOut() : joinEvent()}>
                                    {selectedEvent.amount > 0 ? 'Pay and Join' : 'Join Event'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {
                events.length == 0 &&
                <div className="flex w-full justify-center">
                    <p className="font-product-sans font-semi-bold text-center text-xl">No events available</p>
                </div>
            }
            <div className={`relative top-[6rem] ${isSmallScreen ? 'text-center mx-auto mb-[4rem]' : 'ml-[5rem]'}`}>
                <h2 className="font-product-sans font-semibold text-2xl">My Forums</h2>
            </div>
            <div className="pb-[4rem] pt-[4rem]">
                <div id="no-scroll" className="flex w-screen flex-row md:items-start xs:items-center xs:justify-center md:justify-start gap-4 mt-[30px]" style={{ width: containerWidth }}>
                    {isSmallScreen ? (
                        <Carousel className="w-full h-[70%]" indicatorContainerProps={{ style: { display: 'none' } }}>
                            {forums.map((forum, index) => (
                                <div key={index} className="flex-col border items-center border-gray-800 rounded-2xl bg-white w-[80%] mx-auto lg:w-[20%] flex justify-center h-[70%]">
                                    <Image
                                        src={`/assets/forums/${forum.name}.jpg`} // Update the file extension if your images are not .jpg
                                        alt={forum.name}
                                        width={60} // Update these values as needed
                                        height={60}
                                        className="mt-[20px]" />
                                    <p className="font-product-sans font-bold p-3">{forum.name}</p>
                                    <p className="font-product-sans-m text-sm p-3 text-justify">
                                        {showFullDescription[index] || forums[index].description.length <= 46 ? forum.description : `${forum.description.substring(0, 46)}...`}
                                        {forums[index].description.length > 46 && (
                                            <button onClick={() => toggleShowFullDescription(index)}>
                                                {showFullDescription[index] ? '... Show Less' : 'Show More'}
                                            </button>
                                        )}
                                    </p>
                                    <button className="font-product-sans font-bold p-3 text-blue-500 text-[11px] self-end" onClick={() => { router.push({ pathname: '/user/userForum', query: { data: forum.name } }, '/user/userForum') }}>View Dashboard</button>
                                </div>
                            ))}
                        </Carousel>
                    ) : (
                        <Grid container rowSpacing={3} className="mt-[2rem] mx-auto flex flex-wrap">
                            {forums.map((forum, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index} className=''>
                                    <div key={index} className="mx-auto flex-col border items-center border-gray-800 rounded-2xl bg-white w-[80%] flex justify-center">
                                        <Image
                                            src={`/assets/forums/${forum.name}.jpg`} // Update the file extension if your images are not .jpg
                                            alt={forum.name}
                                            width={60} // Update these values as needed
                                            height={60}
                                            className="mt-[20px]" />
                                        <p className="font-product-sans font-bold p-3">{forum.name}</p>
                                        <p className="font-product-sans-m text-sm p-3 text-justify">
                                            {showFullDescription[index] || forums[index].description.length <= 46 ? forum.description : `${forum.description.substring(0, 46)}...`}
                                            {forums[index].description.length > 46 && (
                                                <button onClick={() => toggleShowFullDescription(index)}>
                                                    {showFullDescription[index] ? '... Show Less' : 'Show More'}
                                                </button>
                                            )}
                                        </p>
                                        <button className="font-product-sans font-bold p-3 text-blue-500 text-[11px] self-end" onClick={() => { router.push({ pathname: '/user/userForum', query: { data: forum.name } }, '/user/userForum') }}>View Dashboard</button>
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </div>
                <div className="flex justify-center mt-[30px]">
                    <button type="button" onClick={handleModalOpen} className="hire flex items-center p-3 mt-[2rem] border-gray-800 border-[1px] rounded-[50px]">
                        <span className="font-product-sans xs:text-sm sm:text-base">Join a New Community</span>
                        <svg className="rtl:rotate-180 xs:w-2.5 sm:w-3.5 xs:h-2.5 sm:h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </button>
                </div>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={handleModalClose}
                    className="fixed inset-0 flex items-center justify-center z-50 outline-none focus:outline-none"
                    overlayClassName="fixed inset-0 bg-black/[0.7]"
                >
                    <div className="relative w-auto max-w-sm mx-auto my-6">
                        <div className="relative flex flex-col w-full bg-white outline-none focus:outline-none rounded-2xl shadow-lg">
                            <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                                <h3 className="text-xl font-semibold">Add Organization</h3>
                            </div>
                            <div className="relative p-6 flex-auto">
                                <select value={selectedOrg} onChange={handleOrgSelect}>
                                    <option value="">Select</option> {/* Add this line */}
                                    {organizations.map((org, index) => (
                                        <option key={index} value={org}>{org}</option>
                                    ))}
                                </select>
                                {selectedOrg && (
                                    <div className='mt-3'>
                                        <input type="text" placeholder="Enter the ID here" style={{ border: '2px solid black' }} value={inputValue} onChange={handleInputChange} />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-end p-2 border-t border-solid border-gray-300 rounded-b">
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white uppercase bg-blue-500 rounded shadow outline-none active:bg-blue-600 hover:shadow-lg focus:outline-none"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
            <div className="w-[96%] mx-auto">
                <div className="antialiased sans-serif bg-blue-100 h-full rounded-lg xs:pb-[1rem]">
                    {!isSmallScreen ? (
                        <div className="lg:container xs:bg-blue-100 xs:rounded-lg mx-auto xs:pt-[2rem] xs:pb-[2rem] md:py-12">
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="flex items-center justify-between py-2 px-6">
                                    <div>
                                        <span className="text-lg font-bold text-gray-800">{MONTH_NAMES[month]}</span>
                                        <span className="ml-1 text-lg text-gray-600 font-normal">{year}</span>
                                    </div>
                                    <div className="flex border rounded-lg space-x-5 justify-center p-1">
                                        <button
                                            type="button"
                                            className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-2 items-center"
                                            disabled={month == 0}
                                            onClick={() => { setMonth(month - 1); getNoOfDays(); }}
                                        >
                                            Previous
                                        </button>
                                        <div className="border-r inline-flex h-"></div>
                                        <button
                                            type="button"
                                            className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex items-center cursor-pointer hover:bg-gray-200 p-2"
                                            disabled={month == 11}
                                            onClick={() => { setMonth(month + 1); getNoOfDays(); }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                                <div className="-mx-1 -mb-1">
                                    <div className="flex flex-wrap" style={{ marginBottom: '-40px' }}>
                                        {DAYS.map((day, index) =>
                                            <div style={{ width: '14.26%' }} className="px-2 py-2" key={index}>
                                                <div className="text-gray-600 text-sm uppercase tracking-wide font-bold text-center">{day}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap border-t border-l">
                                        {blankdays.map((i) =>
                                            <div style={{ width: '14.28%', height: '120px' }} className="text-center border-r border-b px-4 pt-2" key={i}></div>
                                        )}
                                        {no_of_days.map((date, i) =>
                                            <div className="px-4 pt-2 border-r border-b relative w-[14.28%] h-[120px]" key={i}>
                                                <div
                                                    onClick={() => showEventModal(date)}
                                                    className={`inline-flex w-6 h-6 xs:mt-[2rem] lg:mt-0 items-center justify-center cursor-pointer text-center leading-none rounded-full transition ease-in-out duration-100 ${isToday(date) ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-200'}`}
                                                >
                                                    {date}
                                                </div>
                                                <div style={{ height: '80px' }} className="overflow-y-auto mt-1">
                                                    {calevents && calevents.filter(e => new Date(e.event_date).toDateString() === new Date(year, month, date).toDateString()).map((event, i) =>
                                                        <div
                                                            className={`px-2 py-1 rounded-lg mt-1 cursor-pointer overflow-hidden border ${event.event_theme === 'blue' ? 'border-blue-200 text-blue-800 bg-blue-100' : event.event_theme === 'red' ? 'border-red-200 text-red-800 bg-red-100' : event.event_theme === 'yellow' ? 'border-yellow-200 text-yellow-800 bg-yellow-100' : event.event_theme === 'green' ? 'border-green-200 text-green-800 bg-green-100' : 'border-purple-200 text-purple-800 bg-purple-100'}`}
                                                            key={i} onClick={() => deleteEvent(event)}
                                                        >
                                                            <p className="text-sm truncate leading-tight">{event.event_title}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={`relative pt-[2rem] ${isSmallScreen ? 'text-center mx-auto' : 'ml-[5rem]'}`}>
                                <h2 className="font-product-sans font-semibold text-2xl">Calendar</h2>
                            </div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateCalendar
                                    loading={isLoading}
                                    onMonthChange={handleMonthChange}
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    renderLoading={() => <DayCalendarSkeleton />}
                                    slots={{
                                        day: ServerDay,
                                    }}
                                    slotProps={{
                                        day: {
                                            highlightedDays,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </>
                    )}
                    {openEventModal &&
                        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full">
                            <div className="p-4 max-w-xl mx-auto relative left-0 right-0 overflow-hidden mt-24">
                                <div className="shadow  rounded-lg bg-white overflow-hidden w-full block p-8">
                                    <h2 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">Add Event Details</h2>
                                    <div className="mb-4">
                                        <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Event title</label>
                                        <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={event_title} onChange={(e) => setEvent_title(e.target.value)} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Event date</label>
                                        <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={event_date} readOnly />
                                    </div>
                                    <div className="inline-block w-64 mb-4">
                                        <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Select a theme</label>
                                        <div className="relative">
                                            <select value={event_theme} onChange={(e) => setEvent_theme(e.target.value)} className="block appearance-none w-full bg-gray-200 border-2 border-gray-200 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-gray-700">
                                                <option value="blue">Blue Theme</option>
                                                <option value="red">Red Theme</option>
                                                <option value="yellow">Yellow Theme</option>
                                                <option value="green">Green Theme</option>
                                                <option value="purple">Purple Theme</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-8 text-right">
                                        <button type="button" className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm mr-2" onClick={() => setOpenEventModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="button" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 border border-gray-700 rounded-lg shadow-sm" onClick={addEvent}>
                                            Save Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <footer className="text-gray-600 body-font">
                <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
                    <div className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
                        <img src="/assets/authlogo.png" width={90} />
                        <span className="ml-3 text-xl">Forums CEC</span>
                    </div>
                    <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">© 2024 Forums CEC</p>
                </div>
            </footer>
        </>
    );
};

export async function getServerSideProps(context) {
    const username = context.req.cookies.username;
    if (!username) {
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false,
            },
        }
    }
    // If username is available, pass it as a prop
    return {
        props: {
            username
        }
    }
}

export default Dashboard;