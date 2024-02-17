import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import emailjs from '@emailjs/browser';
import Cookies from 'js-cookie';

const LoginPage = () => {
    const [data, setData] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(null));
    const [realOtp, setRealOtp] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter();

    const dev = () => {
        router.push('/forgetPassword');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        setData(data);
        if (data.message === 'Login Successful') {
            const otp = Math.floor(100000 + Math.random() * 900000);
            setRealOtp(otp.toString());
            const email = data.email;
            emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID1, process.env.NEXT_PUBLIC_TEMPLATE_ID1, { email, otp }, process.env.NEXT_PUBLIC_PUBLIC_KEY1)
                .then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    setModalIsOpen(true);
                }, (err) => {
                    console.log('FAILED...', err);
                });
        } else {
            alert(data.message);
        }
    }

    const verifyOtp = async () => {
        if (otp.join('') === realOtp) {
            setIsVerified(true);
            setModalIsOpen(false);
            Cookies.set('username', username);
            Cookies.set('token', data.token);
            router.replace('/test');
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

    const handleSignUp = (e) => {
        e.preventDefault();
        router.push('/signup');
    }

    return (
        <>
            <div className="flex h-screen items-center justify-center lg:justify-start" style={{ backgroundImage: 'url("/assets/back.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-full absolute top-2 flex justify-between items-center">
                    <img src="/assets/logo.png" width={100} />
                </div>
                {/* Left Part - Image covering the whole page */}
                <div className="hidden lg:flex lg:flex-1">
                </div>

                {/* Right Part - Centered Login Form above the image */}
                <div className="max-w-md bg-white p-8 rounded-2xl shadow-md mx-auto sm:w-full sm:max-w-md lg:mr-32 lg:w-1/4 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                    <h2 className="text-2xl font-semibold mb-4">Login</h2>

                    {/* Login Form */}
                    <form>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Username</label>
                            <input type="text" id="username" name="username" className="w-full p-2 border border-gray-300 rounded" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Password</label>
                            <input type="password" id="password" name="password" className="w-full p-2 border border-gray-300 rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            {/* Forgot password */}
                            <div className='flex justify-end mt-2'>
                                <span className="text-md font-medium text-blue-500 hover:text-blue-600 hover:underline block text-right mt-4 cursor-pointer" onClick={dev}>Forgot Password?</span>
                            </div>
                        </div>
                        <div className='flex justify-center'>
                            <button type="submit" className="w-[50%] bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" onClick={handleLogin}>
                                Log In
                            </button>
                        </div>
                        <div className='flex justify-center mt-4'>
                            <span className='text-md text-black block text-right mt-4'>Not Registered Yet?&nbsp;</span><a href="#" className="text-md font-medium text-blue-500 hover:text-blue-600 hover:underline block text-right mt-4" onClick={handleSignUp}>Sign Up</a>
                        </div>
                    </form>
                </div>
            </div>
            <div className="flex items-center justify-center absolute bottom-2 left-4">
                <div className="p-2 rounded-2xl shadow-md mx-4 sm:mx-auto sm:w-full sm:max-w-md lg:mx-0 lg:w-full">
                    <p className="text-md text-center">© 2024 My Website. All rights reserved.</p>
                </div>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={handleModalClose}
                className="fixed inset-0 flex items-center justify-center z-50 outline-none focus:outline-none"
                overlayClassName="fixed inset-0 bg-black opacity-90"
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

export default LoginPage;
