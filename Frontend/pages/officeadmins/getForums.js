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
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LinearProgress from '@mui/material/LinearProgress';
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
    const [adminDesc, setAdminDesc] = useState("");
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
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrengthInd, setPasswordStrengthInd] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

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

    const createNewAdmin = async (event) => {
        // Handle image upload 
        const handleImageUpload = async (event) => {
            const formData = new FormData();
            formData.append('forumImage', selectedImage);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/officeadmin/uploadForumLogo`, {
                    method: 'POST', body: formData,
                });
                if (response.ok) {
                    // Handle success 
                    toast.success('Logo uploaded successfully',
                        {

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
                    // Handle error 
                    toast.error('Failed to upload image',
                        {

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
                console.error('Error uploading image:', error);
            }
        };
        await handleImageUpload(event);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/officeadmin/createNewAdmin`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', },
                    body: JSON.stringify({ name: adminName, forum: adminForum, email: adminEmail, username: adminUserName, password: adminPassword, organizationDescription: adminDesc }),
                });
            const data = await response.json();
            if (data.message == "Admin created successfully") {
                toast.success('Admin created successfully',
                    {
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
                toast.error('Error in creating admin',
                    {
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
        } catch (error) { console.error('Error fetching event participants:', error); }
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

    const calculatePasswordStrength = (password) => {
        // Logic to calculate password strength
        // Example: Consider length and complexity
        const lengthScore = password.length / 10; // Normalize length to a score out of 10
        const complexityScore = /[a-zA-Z]/.test(password) && /\d/.test(password) ? 1 : 0; // If password contains both letters and numbers, complexity score is 1, else 0
        return lengthScore * 0.5 + complexityScore * 0.5; // Equal weightage to length and complexity
    };

    useEffect(() => {
        setPasswordStrengthInd(calculatePasswordStrength(adminPassword)); // Update password strength score
    }, [adminPassword]);

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

    const handleAdminImageUpload = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const removeUploadedImage = () => {
        const fileInput = document.getElementById("adminImage");
        // Reset the value of the file input field
        fileInput.value = null;
        resetSelectedImage();
    };

    const resetSelectedImage = () => {
        setSelectedImage(null);
    };

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
                                    // src={`/assets/forums/${forum}.jpg`}
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums/${forum}.jpg`}
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
                                    label="Name of Forum (Enter in Caps)"
                                    fullWidth
                                    required
                                    value={adminForum}
                                    onChange={(e) => setAdminForum(e.target.value)}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    label="Description"
                                    fullWidth
                                    required
                                    value={adminDesc}
                                    onChange={(e) => setAdminDesc(e.target.value)}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    label="Email"
                                    fullWidth
                                    required
                                    error={adminEmail && !adminEmail.endsWith('@ceconline.edu')}
                                    helperText={
                                        adminEmail && !adminEmail.endsWith('@ceconline.edu')
                                            ? 'Email must end with @ceconline.edu'
                                            : ''
                                    }
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
                                <label htmlFor="adminImage" className="font-product-sans text-sm mt-[2.5rem]">Upload Forum Logo</label>
                                <div className="flex items-center justify-center w-full mt-[0.9rem]">
                                    <label htmlFor="adminImage" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-200">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">JPG Image needed (Upload with file name FORUMNAME.jpg)</p>
                                            <br />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">(200 * 200 Preferred)</p>
                                        </div>
                                        <input id="adminImage" onChange={handleAdminImageUpload} type="file" accept="image/jpeg" className="hidden" />
                                    </label>
                                </div>
                                {selectedImage && (
                                    <div>
                                        <img src={URL.createObjectURL(selectedImage)} alt="Uploaded Image" className="mt-2 mb-4 mx-auto rounded-lg" style={{ maxWidth: "200px" }} />
                                        <Button onClick={removeUploadedImage}>Remove</Button>
                                    </div>
                                )}
                                <FormControl className="w-[100%] mt-4" size="large" variant="outlined" required>
                                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={adminPassword}
                                        required
                                        onChange={(e) => {
                                            setAdminPassword(e.target.value);
                                            checkPasswordStrength(e.target.value);
                                        }}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Password"
                                    />
                                </FormControl>
                                <div>
                                    <LinearProgress
                                        variant="determinate"
                                        className="mt-4 w-[20%]"
                                        sx={{
                                            height: 8, // Increase the thickness of the progress bar
                                            borderRadius: 10, // Make the sides curved
                                            overflow: 'hidden', // Hide overflow to prevent sharp corners
                                        }}
                                        value={
                                            (passwordStrength.hasUpperCase +
                                                passwordStrength.hasLowerCase +
                                                passwordStrength.hasDigit +
                                                passwordStrength.hasSpecialChar +
                                                passwordStrength.isBetween6And20) *
                                            20
                                        }
                                        color={
                                            passwordStrength.hasUpperCase &&
                                                passwordStrength.hasLowerCase &&
                                                passwordStrength.hasDigit &&
                                                passwordStrength.hasSpecialChar &&
                                                passwordStrength.isBetween6And20
                                                ? "success"
                                                : "error"
                                        }
                                    />
                                    <p className="text-xs mt-1">{passwordStrengthInd < 0.3 ? "Weak" : passwordStrengthInd < 0.7 ? "Moderate" : "Strong"}</p>
                                </div>
                                <div className="mt-2">
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
                                        !adminName ||
                                        !adminForum ||
                                        !adminEmail ||
                                        !adminUserName ||
                                        !adminPassword ||
                                        !passwordStrength.hasUpperCase ||
                                        !passwordStrength.hasLowerCase ||
                                        !passwordStrength.hasDigit ||
                                        !passwordStrength.hasSpecialChar ||
                                        !passwordStrength.isBetween6And20 ||
                                        passwordStrengthInd < 0.3 ||
                                        !adminEmail.endsWith('@ceconline.edu')
                                    }
                                    onClick={createNewAdmin}
                                    variant="outlined"
                                    color="primary"
                                    className={`mt-6 hover:bg-green-200 ${(!adminName || !adminForum || !adminEmail || !adminUserName || !adminPassword) && 'hidden'}`}
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

export default getForums;
