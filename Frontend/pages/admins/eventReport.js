import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const Editor = dynamic(
    () => import('jodit-pro-react').then((mod) => mod.default),
    { ssr: false }
);

const EventReport = () => {
    const [events, setEventDetails] = useState(null);
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventParticipant, setEventParticipant] = useState('');
    const [eventHighlights, setEventHighlights] = useState('');
    const [content, setContent] = useState('');
    const router = useRouter();
    const eventId = Cookies.get('eventId');
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gemini');

    const handleChange = (event) => {
        setSelectedModel(event.target.value);
    };

    useEffect(() => {
        const fetchEventDetails = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getEventDetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventId }),
            });
            const data = await response.json();
            setEventDetails(data.event);
            setEventName(data.event.eventName);
            setEventDate(data.event.date);
            setEventTime(data.event.time);
            setEventLocation(data.event.location);
            setEventParticipant(Cookies.get('participants'));
        };

        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    const handleback = () => {
        router.back();
    }

    const handleRephraseWithAI = async () => {
        if (eventName != '' && eventDate != '' && eventTime != '' && eventLocation != '' && eventParticipant != '') {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/genAI/prompt/${selectedModel}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ eventName, eventDate, eventTime, eventLocation, eventParticipant, eventHighlights })
                })
                const data = await response.json();
                setContent(data.text);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        } else {
            toast.error('Please ensure that all the event details are filled.', {
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        return formattedDate;
    };

    // Function to convert time to user-readable format
    const formatTime = (timeString) => {
        const time = new Date(`01/01/2022 ${timeString}`);
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedTime = time.toLocaleTimeString('en-US', options);
        return formattedTime;
    };

    return (
        <>
            <ToastContainer />
            <div className="shadow-lg">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={160} onClick={handleback} className='cursor-pointer' />
                </div>
            </div>
            <div className="w-full flex flex-col items-center mt-10 overflow-x-auto">
                <h1 className="text-2xl font-bold mb-4">Report Your Event Details here</h1>

                <div className="p-8 border rounded mb-4 bg-gray-200 flex-grow overflow-x-auto">
                    <h2 className="text-lg font-bold mb-2">Event Summary</h2>
                    <div>
                        <Editor
                            value={content}
                            onChange={setContent}
                            config={{
                                height: 500,
                                showCharsCounter: true, // Hide character counter
                                showWordsCounter: true, // Hide word counter
                                uploader: {
                                    insertImageAsBase64URI: true, // Enable inserting images as Base64 URIs
                                    insertVideoAsBase64URI: true, // Enable inserting videos as Base64 URIs
                                },
                            }}
                            tabIndex={1} // tabIndex of textarea
                            style={{
                                '& ul': {
                                    listStyleType: 'disc',
                                    color: 'black',
                                },
                                '& ol': {
                                    listStyleType: 'decimal',
                                    color: 'black',
                                },
                            }}
                        />
                    </div>
                    <div className="p-2 border rounded mt-12 bg-gray-200 flex-grow overflow-x-auto">
                        <h2 className="text-2xl text-center font-bold mb-4">Event Details</h2>
                        {events && (
                            <div key={events._id} className="flex flex-col items-center mb-4 gap-y-4">
                                <TextField id={`event-name`} label="Event Name" variant="outlined" value={eventName} onChange={(e) => setEventName(e.target.value)} sx={{ width: '75%' }} />
                                <TextField id={`event-date`} label="Date" variant="outlined" value={formatDate(eventDate)} sx={{ width: '75%' }} />
                                <TextField id={`event-location`} label="Location" variant="outlined" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} sx={{ width: '75%' }} />
                                <TextField id={`event-time`} label="Time" variant="outlined" value={formatTime(eventTime)} sx={{ width: '75%' }} />
                                <TextField id={`event-participants`} label="Number of Participants" variant="outlined" value={eventParticipant} onChange={(e) => setEventParticipant(e.target.value)} sx={{ width: '75%' }} />
                                <TextField id={`event-highlights`} label="Event Highlights" variant="outlined" value={eventHighlights} onChange={(e) => setEventHighlights(e.target.value)} sx={{ width: '75%' }} />
                            </div>
                        )}
                    </div>
                    {/* <TextField id="outlined-basic" label="Enter prompt here" variant="outlined" value={prompt} onChange={(e) => setPrompt(e.target.value)} multiline className="w-full h-[4rem] mt-[5rem]" rows={3}/> */}
                    <div className="flex items-center justify-center">
                        <Button onClick={handleRephraseWithAI} variant="outlined">
                            {loading ? (
                                <>
                                    <CircularProgress size={24} />
                                    <span className="ml-2">Generating ...</span>
                                </>
                            ) : (
                                'Generate with AI'
                            )}
                        </Button>
                        <FormControl sx={{ m: 1, minWidth: 120, marginTop: 1, marginLeft: 2 }} size="small">
                            <InputLabel id="demo-simple-select-helper-label">Model</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={selectedModel}
                                label="Model"
                                onChange={handleChange}
                            >
                                <MenuItem value="gemini">Google Gemini</MenuItem>
                                <MenuItem value="groq">Meta Llama3 (Faster)</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
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
    )
}

export async function getServerSideProps(context) {
    // Get username from cookies
    const username = context.req.cookies.adminUsername;
    const eventId = context.req.cookies.eventId;

    // If username is not available, redirect to login
    if (!username) {
        return {
            redirect: {
                destination: '/adminAuth/login',
                permanent: false,
            },
        }
    }

    // If username is available, pass it as a prop
    return {
        props: {},
    }
}

export default EventReport;
