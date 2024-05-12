import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import path from 'path'
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@mui/material/Modal';

const events = ({ username }) => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadEventId, setUploadEventId] = useState(null); // Add this line
    const [uploadForumName, setUploadForumName] = useState(null);
    const [uploadEventName, setUploadEventName] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/office/getDetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });
            const data = await response.json();
            setName(data.name);
        };
        fetchDetails();
    }, [username]);

    useEffect(() => {
        const fetchEvents = async () => {
            const responseEvents = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/officeadmin/getAllEvents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            const dataEvents = await responseEvents.json();
            setEvents(dataEvents.events);
        };

        fetchEvents();
    }, []);

    const handleApprove = async (eventId) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateEventApproval`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventId, isApproved: 'Approved' }),
        });

        if (response.ok) {
            toast.success('Event approved', {
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
            setEvents(events.map(event => event._id === eventId ? { ...event, isApproved: 'Approved' } : event));
        } else {
            toast.success('Event approval failed', {
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

    const handleReject = async (eventId) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateEventApproval`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventId, isApproved: 'Rejected' }),
        });

        if (response.ok) {
            toast.success('Event rejected', {
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
            setEvents(events.map(event => event._id === eventId ? { ...event, isApproved: 'Rejected' } : event));
        } else {
            toast.error('Event rejection failed', {
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

    const handleOpen = (imagePath) => {
        setCurrentImage(imagePath);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUploadOpen = (eventId, forumName, eventName) => {
        setUploadEventId(eventId);
        setUploadForumName(forumName);
        setUploadEventName(eventName);
        setUploadOpen(true);
    };

    const handleUploadClose = () => {
        setUploadOpen(false);
    };

    const handlePrincipalApprovalImageUpload = async (event) => {
        event.preventDefault();
        setUploadOpen(false);
        // Get the file from the event
        const file = event.target.files[0];

        // Create a FormData object
        const formData = new FormData();
        formData.append('principalApprovalImage', file);
        formData.append('eventId', uploadEventId);
        formData.append('forumName', uploadForumName);
        formData.append('eventName', uploadEventName);

        // Send a POST request to the backend to upload the file and update the event
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updatePrincipalApprovalImage?forumName=${uploadForumName}&eventName=${uploadEventName}`, {
            method: 'POST',
            body: formData,
        });

        // Check if the request was successful
        if (response.ok) {
            // Get the updated event from the response
            const updatedEvent = await response.json();
            setEvents(events.map(event => event._id === updatedEvent._id ? updatedEvent : event));
        } else {
            // Handle error
            console.error('Failed to upload image');
        }
    };

    return (
        <>
            <ToastContainer />
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px' }}>
                    <h2 id="simple-modal-title">Approval Letter</h2>
                    <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, currentImage)} alt="Approval Letter" width={500} height={500} layout="responsive" />
                </div>
            </Modal>
            <Modal
                open={uploadOpen}
                onClose={handleUploadClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', width: "50%" }}>
                    <h2 id="simple-modal-title">Upload Letter Image</h2>
                    <div class="flex items-center justify-center w-full mt-[1rem]">
                        <label for="approvalImage" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-200">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                            </div>
                            <input id="approvalImage" onChange={handlePrincipalApprovalImageUpload} type="file" accept="image/*" className="hidden" />
                        </label>
                    </div>
                </div>
            </Modal>
            <div className="flex flex-row items-center bg-white justify-center w-full">
                <div className="w-[40%] flex flex-col justify-center items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[20px] mt-[30px] mb-4">
                    <img src="/assets/logo.png" width={150} onClick={() => { router.push('/officeadmins/officeadmin'); }} className='cursor-pointer relative bottom-4 xs:w-[7.9rem]' />
                    <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg mb-2">Welcome, {name}</p>
                </div>
            </div>
            <p className="text-xl font-bold text-center mt-8">Pending Event Requests</p>
            <Grid item xs={12} className='pb-8'>
                <div className="lg:w-full flex flex-col items-center mt-10 xs:w-[70%] mx-auto">
                    {events && events.length > 0 ? (
                        events.map((event, index) => (
                            <div key={index} className="w-full md:w-3/4 lg:w-2/3 p-4 border rounded-2xl mb-4 bg-gray-300 flex flex-col md:flex-row items-center">
                                <div className="md:w-1/6 pr-2">
                                    <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, event.eventImagePath)} alt={event.eventName} width={100} height={100} layout="responsive" />
                                </div>
                                <div className="xs:mt-2 lg:mt-0 md:w-3/4 md:ml-[1rem]">
                                    <h2 className="text-lg font-bold">{event.eventName}</h2>
                                    <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{event.date}</p>
                                    <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{event.time}</p>
                                    <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{event.location}</p>
                                    {event.collabForums.length > 0 && (
                                        <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{event.collabForums.join(', ')}</p>
                                    )}
                                </div>
                                <div className="w-full md:w-1/4 flex flex-wrap justify-end items-center mt-4 md:mt-0 gap-4">
                                    <div className="w-full flex justify-end gap-x-2">
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label={event.isApproved === 'Approved' ? 'Approved' : 'Approve'}
                                            clickable
                                            color={event.isApproved === 'Approved' ? 'success' : 'default'}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                                                if (event.isApproved !== 'Approved') {
                                                    handleApprove(event._id);
                                                }
                                            }}
                                            style={{ width: '50%' }}
                                        />
                                        <Chip
                                            icon={<CancelIcon />}
                                            label={event.isApproved === 'Rejected' ? 'Rejected' : 'Reject'}
                                            clickable
                                            color={event.isApproved === 'Rejected' ? 'error' : 'warning'}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                                                if (event.isApproved !== 'Rejected') {
                                                    handleReject(event._id);
                                                }
                                            }}
                                            style={{ width: '50%' }}
                                        />
                                    </div>
                                    <div className="w-full flex justify-end gap-x-2">
                                        <Chip
                                            icon={<VisibilityIcon />}
                                            label="View Letter"
                                            clickable
                                            color="success"
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                                                if (event.approvalImagePath) {
                                                    handleOpen(event.approvalImagePath);
                                                } else {
                                                    toast.error('Letter not found', {
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
                                            }}
                                            style={{ width: '50%' }}
                                        />
                                        <Chip
                                            icon={<CloudUploadIcon />}
                                            label={event.principalApprovalImagePath ? 'Uploaded' : 'Upload'}
                                            clickable
                                            variant="outlined"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                                                if (event.principalApprovalImagePath) {
                                                    handleOpen(event.principalApprovalImagePath);
                                                } else {
                                                    handleUploadOpen(event._id, event.forumName, event.eventName);
                                                }
                                            }}
                                            style={{ width: '50%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-[70%] mx-auto p-4 border rounded mb-4 bg-gray-300">
                            No events
                        </div>
                    )}
                </div>
            </Grid>
            <footer className="text-gray-600 body-font w-full">
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
    const username = context.req.cookies.officeUsername;

    // If username is not available, redirect to login
    if (!username) {
        return {
            redirect: {
                destination: '/officeadmins/login',
                permanent: false,
            },
        }
    }

    // If username is available, pass it as a prop
    return {
        props: { username },
    }
}

export default events