import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import bcrypt from 'bcryptjs';
import Modal from 'react-modal';
import emailjs from '@emailjs/browser';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button'
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(null));
    const [realOtp, setRealOtp] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [counter, setCounter] = useState(60);
    const [showResend, setShowResend] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1211) {
                setIsMobileView(true);
            } else {
                setIsMobileView(false);
            }
        };
        handleResize(); // Call once to set initial value
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const calculatePasswordStrength = (password) => {
        // Logic to calculate password strength
        // Example: Consider length and complexity
        const lengthScore = password.length / 10; // Normalize length to a score out of 10
        const complexityScore = /[a-zA-Z]/.test(password) && /\d/.test(password) ? 1 : 0; // If password contains both letters and numbers, complexity score is 1, else 0
        return lengthScore * 0.5 + complexityScore * 0.5; // Equal weightage to length and complexity
    };

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(password)); // Update password strength score
    }, [password]);

    useEffect(() => {
        let timer;
        if (modalIsOpen && counter > 0) {
            timer = setTimeout(() => setCounter(counter - 1), 1000);
        } else if (counter === 0) {
            setShowResend(true);
        }
        return () => clearTimeout(timer);
    }, [modalIsOpen, counter]);

    const handleResend = async () => {
        const otp = Math.floor(100000 + Math.random() * 900000);
        setRealOtp(otp.toString());
        const email = data.email;
        await emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID, process.env.NEXT_PUBLIC_TEMPLATE_ID, { email, otp }, process.env.NEXT_PUBLIC_PUBLIC_KEY);
        setCounter(60); // Reset the counter
        setShowResend(false);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        // const email = document.getElementById('email').value;
        if (!email.endsWith('@ceconline.edu')) {
            toast.warning('Please use an email with domain @ceconline.edu', {
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
            return;
        }
        // const password = document.getElementById('password').value;
        var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        if (!password.match(passw)) {
            toast.error('Password is invalid', {
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
            return;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/checkUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username }),
        });
        const data = await response.json();
        if (data.message === 'A user already exists') {
            toast.warning('User with this credentials already exists', {
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
            return;
        }
        setLoading(true);
        const otp = Math.floor(100000 + Math.random() * 900000);
        setRealOtp(otp.toString());
        emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID1, process.env.NEXT_PUBLIC_TEMPLATE_ID1, { email, otp }, process.env.NEXT_PUBLIC_PUBLIC_KEY1)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                setModalIsOpen(true);
                setLoading(false);
            }, (err) => {
                console.log('FAILED...', err);
            });
    }

    const verifyOtp = async () => {
        if (otp.join('') === realOtp) {
            handleModalClose();
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, username, password: hashedPassword }),
            });
            const data = await response.json();
            if (data.message === 'Sign Up Successful') {
                toast.success('Sign Up Successful', {
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
                setModalIsOpen(false);
            }
            else {
                toast.error(data.message, {
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
            setOtp(Array(6).fill(null));
        }
    }
    const handleModalClose = () => {
        if (otp.join('') === realOtp) {
            setIsVerified(true);
        }
    }
    useEffect(() => {
        if (isVerified) {
            router.replace('/auth/login');
        }
    }, [isVerified]);

    return (
        <>
            <ToastContainer />
            {!isMobileView ? (
                <div className="flex h-screen items-center justify-center bg-gray-200 " style={{ backgroundImage: 'url("/assets/bguest.jpg")', backgroundSize: "cover", backgroundPosition: "center", backgroundBlendMode: "hard-light" }}>
                    <div className="max-w-full bg-white p-8 rounded-3xl  border-2 border-slate-500  shadow-md mx-auto sm:w-full lg:w-1/2 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                        <div className='flex justify-center'>
                            <img src="/assets/authlogo.png" width={160} />
                        </div>
                        <h2 className="text-3xl font-semibold flex justify-end right-[6.5rem] relative top-[7.5rem]">Sign Up</h2>
                        <h2 className="text-md flex justify-end relative top-[8.5rem] right-[2.5rem]">Inspiring innovation, join us now!</h2>
                        <form>
                            <div className="mb-4">
                                <TextField
                                    label="Name"
                                    required
                                    size="small"
                                    className="w-[50%] mb-1"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {/* <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Name</label>
                                <input type="text" id="name" name="name" placeholder="Enter the Name" className="w-[50%] p-2 border border-gray-300 rounded-xl flex justify-end" value={name} onChange={(e) => setName(e.target.value)} required /> */}
                            </div>
                            <div className="mb-4">
                                <TextField
                                    label="Email"
                                    required
                                    size="small"
                                    className="w-[50%] mb-1"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {/* <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Email</label>
                                <input type="text" id="email" name="email" placeholder="Enter email" className="w-[50%] p-2 border border-gray-300 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required /> */}
                            </div>
                            <div className="mb-4">
                                <TextField
                                    label="Username"
                                    required
                                    size="small"
                                    className="w-[50%] mb-1"
                                    value={name}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                {/* <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Username</label>
                                <input type="username" id="username" name="username" placeholder="Enter username" className="w-[50%] p-2 border border-gray-300 rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} required /> */}
                            </div>
                            <div className="mb-4">
                                <FormControl className="w-[100%]" size="small" variant="outlined" required>
                                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-[50%]"
                                        size="small"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                <div className="w-[20%] mt-2 relative top-4">
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(passwordStrength, 1) * 100}
                                        color={passwordStrength < 0.3 ? "error" : passwordStrength < 0.7 ? "warning" : "success"}
                                        sx={{
                                            height: 8, // Increase the thickness of the progress bar
                                            borderRadius: 10, // Make the sides curved
                                            overflow: 'hidden', // Hide overflow to prevent sharp corners
                                        }}
                                    />
                                    <p className="text-xs mt-1">{passwordStrength < 0.3 ? "Weak" : passwordStrength < 0.7 ? "Moderate" : "Strong"}</p>
                                </div>
                                {/* <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Password</label>
                                <input type="password" id="password" name="password" placeholder="Enter password" className="w-[50%] p-2 border border-gray-300 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required /> */}
                            </div>
                            <div className='flex justify-left mt-[2rem]'>
                                {loading ? (
                                    <>
                                        <Button type="submit" variant="outlined" className="w-[10rem] rounded-full bg-blue-200 py-2 px-4">
                                            <CircularProgress size={24} color="success" />
                                            <span className="ml-2" style={{ textTransform: 'none' }}>Sending OTP</span>
                                        </Button>
                                    </>
                                ) : (
                                    <button type="submit" className="w-[20%] bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600" onClick={handleSignUp}>
                                        Sign Up
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-screen bg-gray-200" style={{ backgroundImage: 'url("/assets/bguest.jpg")', backgroundSize: "cover", backgroundPosition: "center", backgroundBlendMode: "hard-light" }}>
                    <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md">
                        <img src="/assets/logo.png" width={110} className="mx-auto" />
                    </div>
                    <div className="flex-grow flex items-center justify-center">
                        <div className="max-w-full bg-white p-8 rounded-3xl shadow-md mx-auto sm:w-full lg:w-1/2 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                            <div className='flex justify-center'>
                                <img src="/assets/authlogo.png" width={160} />
                            </div>
                            <h2 className="text-3xl font-semibold text-center mt-6 mb-2">Sign Up</h2>
                            <form>
                                <div className="mb-4">
                                    <TextField
                                        label="Name"
                                        required
                                        size="small"
                                        className="w-full mb-4 mt-4"
                                        value={username}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    {/* <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Name</label>
                                    <input type="text" id="name" name="name" placeholder="Enter the Name" className="w-full p-2 border border-gray-300 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} required /> */}
                                </div>
                                <div className="mb-4">
                                    <TextField
                                        label="Email"
                                        required
                                        size="small"
                                        className="w-full mb-4"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {/* <label htmlFor="email" className="block text-gray-600 text-sm mb-2">Email</label>
                                        <input type="text" id="email" name="email" placeholder="Enter email" className="w-full p-2 border border-gray-300 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required /> */}
                                </div>
                                <div className="mb-4">
                                    <TextField
                                        label="Username"
                                        required
                                        size="small"
                                        className="w-full mb-4"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    {/* <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Username</label>
                                    <input type="text" id="username" name="username" placeholder="Enter username" className="w-full p-2 border border-gray-300 rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} required /> */}
                                </div>
                                <div className="mb-4">
                                    <FormControl className="w-[100%] mb-4" size="small" variant="outlined" required>
                                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                        <OutlinedInput
                                            id="outlined-adornment-password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="w-full"
                                            size="small"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                    <div className="w-[40%] mt-2">
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(passwordStrength, 1) * 100}
                                            color={passwordStrength < 0.3 ? "error" : passwordStrength < 0.7 ? "warning" : "success"}
                                            sx={{
                                                height: 8, // Increase the thickness of the progress bar
                                                borderRadius: 10, // Make the sides curved
                                                overflow: 'hidden', // Hide overflow to prevent sharp corners
                                            }}
                                        />
                                        <p className="text-xs mt-1">{passwordStrength < 0.3 ? "Weak" : passwordStrength < 0.7 ? "Moderate" : "Strong"}</p>
                                    </div>
                                    {/* <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Password</label>
                                        <input type="password" id="password" name="password" placeholder="Enter password" className="w-full p-2 border border-gray-300 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required /> */}
                                </div>
                                <div className='flex justify-center'>
                                    {loading ? (
                                        <>
                                            <Button type="submit" variant="outlined" className="w-[10rem] rounded-full bg-blue-200 py-2 px-4">
                                                <CircularProgress size={24} color="success" />
                                                <span className="ml-2" style={{ textTransform: 'none' }}>Sending OTP</span>
                                            </Button>
                                        </>
                                    ) : (
                                        <button type="submit" className="w-1/2 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600" onClick={handleSignUp}>
                                            Sign Up
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={handleModalClose}
                className="fixed inset-0 flex items-center justify-center z-50 outline-none focus:outline-none"
                overlayClassName="fixed inset-0 bg-black opacity-100"
            >
                <div className="relative w-auto max-w-sm mx-auto my-6">
                    <div className="relative flex flex-col w-full bg-white outline-none focus:outline-none rounded-2xl shadow-lg">
                        <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                            <h3 className="text-xl font-semibold">Enter the OTP</h3>
                        </div>
                        <div className="relative p-6 flex-auto flex justify-between">
                            {otp.map((digit, index) => (
                                <input
                                    type="text"
                                    maxLength='1'
                                    value={digit || ''}
                                    onChange={(e) => {
                                        if (e.target.value === '') {
                                            // Allow deleting values
                                            setOtp([...otp.slice(0, index), null, ...otp.slice(index + 1)]);
                                        } else if (/^[0-9]$/.test(e.target.value)) {
                                            // Change value and focus next input if the entered value is a digit
                                            setOtp([...otp.slice(0, index), e.target.value, ...otp.slice(index + 1)]);
                                            const nextSibling = document.querySelector(`input[name="${index + 2}"]`);
                                            if (nextSibling !== null) {
                                                nextSibling.focus();
                                            }
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && otp[index] === null) {
                                            const previousSibling = document.querySelector(`input[name="${index}"]`);
                                            if (previousSibling !== null) {
                                                previousSibling.focus();
                                            }
                                        }
                                    }}
                                    name={index + 1}
                                    className="w-10 px-3 py-2 mb-4 mr-2 text-base text-black placeholder-gray-600 border rounded-lg focus:shadow-outline"
                                    autoFocus={index === 0}
                                    autocomplete="off"
                                />
                            ))}
                        </div>
                        <div className="flex justify-end mr-[1rem] relative bottom-[1rem]">
                            {counter > 0 && <p>Resend OTP in {counter} seconds</p>}
                            {showResend && <button onClick={handleResend} style={{ color: "blue" }}>Resend OTP</button>}
                        </div>
                        <div className="flex items-center justify-end p-2 border-t border-solid border-gray-300 rounded-b">
                            <button
                                onClick={verifyOtp}
                                className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white uppercase bg-blue-500 rounded shadow outline-none active:bg-blue-600 hover:shadow-lg focus:outline-none"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

        </>
    );
};

export default SignUpPage;
