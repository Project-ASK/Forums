//Entering email page
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import emailjs from '@emailjs/browser';
import Modal from 'react-modal';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(null));
    const [realOtp, setRealOtp] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
    const [counter, setCounter] = useState(60);
    const [showResend, setShowResend] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();
        // const email = document.getElementById('email').value;
        if (!email.endsWith('@ceconline.edu')) {
            alert('Please use an email with domain @ceconline.edu');
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        setRealOtp(otp.toString());
        emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID1, process.env.NEXT_PUBLIC_TEMPLATE_ID1, { email, otp }, process.env.NEXT_PUBLIC_PUBLIC_KEY1)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                setModalIsOpen(true);
            }, (err) => {
                console.log('FAILED...', err);
            });
        setIsEmailSubmitted(true);
    }

    const verifyOtp = async () => {
        if (otp.join('') === realOtp) {
            setIsVerified(true);
            setModalIsOpen(false);
        } else {
            alert('Incorrect OTP. Please try again.');
        }
        setOtp(Array(6).fill(null)); // Clear the OTP input box
    }

    const handleModalClose = () => {
        if (otp.join('') === realOtp) {
            setIsVerified(true);
        }
    }

    const updatePassword = async () => {
        const password = newPassword;
        var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        if (!password.match(passw)) {
            alert('Password is invalid');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resetPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword }),
        });
        const data = await response.json();
        if (data.message === 'Password updated successfully') {
            router.replace('/auth/login');
        } else {
            alert('Error updating password. Please try again.');
        }
    }

    return (
        <>
            <div className="flex h-screen items-center justify-center bg-gray-200">
                <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-full absolute top-2 flex justify-between items-center">
                    <img src="/assets/logo.png" width={110} />
                </div>
                <div className="max-w-md bg-white p-8 rounded-2xl shadow-md mx-auto sm:w-full sm:max-w-md lg:w-1/4 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                    <div className='flex justify-center'>
                        <img src="/assets/authlogo.png" width={130} />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4 relative top-[1rem] text-center">{isEmailSubmitted ? "Reset Password" : "Forgot Password"}</h2>
                    {!isEmailSubmitted &&
                        <form>
                            <div className="mt-8 relative top-[1rem]">
                                <TextField
                                    label="Email"
                                    id="outlined-size-small"
                                    required
                                    defaultValue=""
                                    size="small"
                                    className="w-full"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {/* <label htmlFor="email" className="block text-gray-600 text-sm mb-2">Enter the Email</label>
                                <input type="email" id="email" name="email" placeholder="Enter email here" className="w-full p-2 border border-gray-300 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} /> */}
                            </div>

                            <div className='flex justify-center mt-[3rem]'>
                                <button type="submit" className="w-[40%] bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600" onClick={handleSubmit}>
                                    Submit
                                </button>
                            </div>
                        </form>
                    }
                    {isVerified && (
                        <form>
                            <div className="mb-4 mt-[2rem]">
                                <FormControl className="w-[100%]" size="small" variant="outlined" required>
                                    <InputLabel htmlFor="outlined-adornment-password">New Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-password"
                                        type={showPassword ? 'text' : 'password'}
                                        size="small"
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                                        label="New Password"
                                    />
                                </FormControl>
                                {/* <label htmlFor="newPassword" className="block text-gray-600 text-sm mb-2">Enter New Password</label>
                                <input type="password" id="newPassword" name="newPassword" className="w-full p-2 border border-gray-300 rounded-xl" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /> */}
                            </div>
                            <div className="mb-8">
                                <FormControl className="w-[100%]" size="small" variant="outlined" required>
                                    <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-password"
                                        type={showPassword ? 'text' : 'password'}
                                        size="small"
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        label="Confirm Password"
                                    />
                                </FormControl>
                                {/* <label htmlFor="confirmPassword" className="block text-gray-600 text-sm mb-2">Confirm New Password</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" className="w-full p-2 border border-gray-300 rounded-xl" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /> */}
                            </div>
                            <div className='flex justify-center'>
                                <button type="button" className="w-[50%] bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600" onClick={updatePassword}>
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
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

export default ForgotPassword;
