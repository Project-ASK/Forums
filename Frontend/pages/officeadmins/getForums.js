import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Chip from '@mui/material/Chip';
import { Dialog, DialogTitle, DialogContent, TextField, Button } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getForums = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [forums, setForums] = useState([]);
    const [forumDetailModal, setForumDetailModal] = useState(false);
    const [selectedForumDetails, setSelectedForumDetails] = useState(null);
    const [selectedForumEvents, setSelectedForumEvents] = useState([]);
    const [forumAdminName, setForumAdminName] = useState("");
    const [eventParticipants, setEventParticipants] = useState({});
    const [adminCreateModal, setAdminCreateModal] = useState(false);
    const [adminName, setAdminName] = useState("");
    const [adminForum, setAdminForum] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminUserName, setAdminUserName] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasDigit: false,
        hasSpecialChar: false,
        isBetween6And20: false,
    });

    useEffect(() => {
        const storedName = Cookies.get("name");
        if (storedName) {
            setName(storedName);
        } else {
            setName("user");
        }
    }, []);

    useEffect(() => {
        const fetchForums = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllForums`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setForums(data.forums);
            } catch (error) {
                console.error('Error fetching forums:', error);
            }
        };
        fetchForums();
    }, []);

    const fetchEvents = async (forum) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllEventsByForum?forum=${forum}`, {
                method: 'GET',
            });
            const data = await response.json();
            setSelectedForumEvents(data.events);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    const fetchAdminName = async (forum) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAdminByForum`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ forum }),
            });
            const data = await response.json();
            setForumAdminName(data.name);
        } catch (error) {
            console.error('Error fetching admin name:', error);
        }
    }

    const fetchEventParticipants = async (eventName) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/getUsers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventName }),
            });
            const data = await response.json();
            setEventParticipants((prevState) => ({
                ...prevState,
                [eventName]: data.users.length,
            }));
        } catch (error) {
            console.error('Error fetching event participants:', error);
        }
    }

    const createNewAdmin = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/officeadmin/createNewAdmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: adminName,
                    forum: adminForum,
                    email: adminEmail,
                    username: adminUserName,
                    password: adminPassword
                }),
            });
            const data = await response.json();
            if (data.message == "Admin created successfully") {
                toast.success('Admin created successfully', {
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
                handleCloseAdminCreateModal();
            } else {
                toast.error('Error in creating admin', {
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
        } catch (error) {
            console.error('Error fetching event participants:', error);
        }
    }

    const handleForumDetailModal = (forum) => {
        setSelectedForumDetails(forum);
        setForumDetailModal(true);
        fetchEvents(forum);
        fetchAdminName(forum);
    }

    const handleForumDetailModalClose = () => {
        setForumDetailModal(false);
        setSelectedForumDetails(null);
        setSelectedForumEvents([]);
        fetchAdminName("");
    }

    const handleCreateAdminModal = () => {
        setAdminCreateModal(true);
    }

    const handleCloseAdminCreateModal = () => {
        setAdminCreateModal(false);
    }

    const checkPasswordStrength = (password) => {
        setPasswordStrength({
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasDigit: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            isBetween6And20: /.{6,20}/.test(password),
        });
    };

    const handleHomeClick = () => {
        router.back();
    }

    const handleLogout = () => {
        // Clear the cookies and redirect the user to the login page
        Cookies.remove('officeUsername');
        Cookies.remove('token');
        router.replace('/officeadmins/login');
    }

    return (
        <>
            <ToastContainer />
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                    <div className="flex flex-row items-center justify-center bg-white py-4">
                        <img src="/assets/logo.png" width={150} onClick={handleHomeClick} className='cursor-pointer mr-4' />
                        <div className="w-[40%] flex flex-col items-center bg-white border border-cyan-800 rounded-full p-4 relative right-[1rem]">
                            <p className="font-product-sans font-bold text-lg md:text-2xl">Welcome, {name}</p>
                        </div>
                        <button onClick={handleLogout} className="lg:mr-0 xs:mr-6 ml-4 px-4 py-2 bg-blue-500 text-white rounded-full">Logout</button>
                    </div>
                    <div className="text-center mt-8">
                        <h2 className="font-bold text-2xl">Forums</h2>
                        <div className="cssbuttons-io-button flex space-x-5 w-[20rem] mx-auto relative top-[1rem] cursor-pointer" onClick={handleCreateAdminModal}>
                            <AddIcon />
                            <p className="font-product-sans text-sm font-normal">Create New Forum Admin</p>
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-3 xs:grid-cols-1 gap-12 mt-12 w-[70%] mx-auto">
                        {forums.map((forum, index) => (
                            <div key={index} className="bg-gray-200 rounded-md p-4 flex flex-col items-center justify-center">
                                <Image
                                    src={`/assets/forums/${forum}.jpg`}
                                    alt={forum}
                                    width={80}
                                    height={80}
                                    className="rounded-full"
                                />
                                <p className="mt-2 text-center font-product-sans">Forum Name: {forum}</p>
                                <Chip
                                    label="View more details"
                                    clickable
                                    variant="contained"
                                    color="primary"
                                    onClick={() => { handleForumDetailModal(forum) }}
                                    style={{ width: '50%', marginTop: "1.4rem" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {forumDetailModal && (
                    <Dialog open={forumDetailModal} onClose={handleForumDetailModalClose}>
                        <DialogTitle>Forum Details</DialogTitle>
                        <DialogContent className="p-4">
                            <p className="font-product-sans">Admin Name: {forumAdminName}</p>
                            <p className="font-product-sans">Number of Events: {selectedForumEvents.length}</p>
                            <p className="font-product-sans">Events:</p>
                            {selectedForumEvents.map((event, index) => (
                                <Accordion key={index} onChange={() => fetchEventParticipants(event.eventName)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>Event {index + 1}: {event.eventName}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>Number of Participants: {eventParticipants[event.eventName] || 0}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </DialogContent>
                    </Dialog>
                )}
                {adminCreateModal && (
                    <Dialog open={adminCreateModal} onClose={handleCloseAdminCreateModal}>
                        <DialogTitle>Create New Forum Admin</DialogTitle>
                        <DialogContent>
                            <>
                                <TextField
                                    label="Admin Name"
                                    fullWidth
                                    required
                                    value={adminName}
                                    onChange={(e) => setAdminName(e.target.value)}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    label="Name of Forum"
                                    fullWidth
                                    required
                                    value={adminForum}
                                    onChange={(e) => setAdminForum(e.target.value)}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    label="Email"
                                    fullWidth
                                    required
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    label="Username"
                                    fullWidth
                                    required
                                    value={adminUserName}
                                    onChange={(e) => setAdminUserName(e.target.value)}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    label="Password"
                                    fullWidth
                                    required
                                    value={adminPassword}
                                    // onChange={(e) => setAdminPassword(e.target.value)}
                                    onChange={(e) => {
                                        setAdminPassword(e.target.value);
                                        checkPasswordStrength(e.target.value);
                                    }}
                                    margin="normal"
                                    variant="outlined"
                                    type="password"
                                />
                                <div>
                                    Password strength:
                                    <ul className="ml-2">
                                        <li>Contains upper case: {passwordStrength.hasUpperCase ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</li>
                                        <li>Contains lower case: {passwordStrength.hasLowerCase ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</li>
                                        <li>Contains digit: {passwordStrength.hasDigit ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</li>
                                        <li>Contains special characters: {passwordStrength.hasSpecialChar ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</li>
                                        <li>Is between 6 and 20 characters: {passwordStrength.isBetween6And20 ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</li>
                                    </ul>
                                </div>
                                <Button
                                    disabled={
                                        !passwordStrength.hasUpperCase ||
                                        !passwordStrength.hasLowerCase ||
                                        !passwordStrength.hasDigit ||
                                        !passwordStrength.hasSpecialChar ||
                                        !passwordStrength.isBetween6And20
                                    }
                                    onClick={createNewAdmin}
                                    variant="outlined"
                                    color="primary"
                                    className="mt-6 hover:bg-green-200"
                                >
                                    Create Admin
                                </Button>
                            </>
                        </DialogContent>
                    </Dialog>
                )}
                <footer className="text-gray-600 body-font">
                    <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
                        <div className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
                            <img src="/assets/authlogo.png" width={90} />
                            <span className="ml-3 text-xl">Forums CEC</span>
                        </div>
                        <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">© 2024 Forums CEC</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default getForums;
