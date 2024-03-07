import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import emailjs from '@emailjs/browser';
import Cookies from 'js-cookie';

const LoginPage = () => {
    const [data, setData] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [forum, setForum] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(null));
    const [realOtp, setRealOtp] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [counter, setCounter] = useState(60);
    const [showResend, setShowResend] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const router = useRouter();

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

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, forum }),
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
            Cookies.set('adminUsername', username);
            Cookies.set('token', data.token);
            Cookies.set('forum', forum);
            router.replace('/admins/admindb');
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

    return (
        <>
            {!isMobileView ? (
                <div className="flex h-screen items-center justify-center bg-gray-200">
                    <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-full absolute top-2 flex justify-between items-center">
                        <img src="/assets/logo.png" width={110} />
                    </div>
                    <div className="max-w-full bg-white p-8 rounded-3xl shadow-md mx-auto sm:w-full lg:w-1/2 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                        <div className='flex justify-center'>
                            <img src="/assets/authlogo.png" width={160} />
                        </div>
                        <h2 className="text-3xl font-semibold flex justify-end mr-[6rem] relative top-[7.5rem]">Sign In</h2>
                        <h2 className="text-md flex justify-end relative top-[8.5rem]">Use your admin username and password</h2>
                        {/* Login Form */}
                        <form>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Username</label>
                                <input type="text" id="username" name="username" placeholder="Enter username" className="w-[50%] p-2 border border-gray-300 rounded-xl flex justify-end" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Password</label>
                                <input type="password" id="password" name="password" placeholder="Enter password" className="w-[50%] p-2 border border-gray-300 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="forum" className="block text-gray-600 text-sm mb-2">Forum Name</label>
                                <input type="text" id="forum" name="forum" placeholder="Enter the Name of Forum" className="w-[50%] p-2 border border-gray-300 rounded-xl" value={forum} onChange={(e) => setForum(e.target.value)} required />
                            </div>
                            <div className='flex justify-left mt-[2rem]'>
                                <button type="submit" className="w-[20%] bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600" onClick={handleLogin}>
                                    Sign In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-screen bg-gray-200">
                    <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md">
                        <img src="/assets/logo.png" width={110} className="mx-auto" />
                    </div>
                    <div className="flex-grow flex items-center justify-center">
                        <div className="max-w-full bg-white p-8 rounded-3xl shadow-md mx-auto sm:w-full lg:w-1/2 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                            <div className='flex justify-center'>
                                <img src="/assets/authlogo.png" width={160} />
                            </div>
                            <h2 className="text-3xl font-semibold text-center mt-6">Sign In</h2>
                            <h2 className="text-md text-center mb-10 relative top-[0.5rem]">Use your admin username and password</h2>
                            {/* Login Form */}
                            <form>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Username</label>
                                    <input type="text" id="username" name="username" placeholder="Enter username" className="w-full p-2 border border-gray-300 rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Password</label>
                                        <input type="password" id="password" name="password" placeholder="Enter password" className="w-full p-2 border border-gray-300 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="forum" className="block text-gray-600 text-sm mb-2">Forum Name</label>
                                        <input type="text" id="forum" name="forum" placeholder="Enter the Forum" className="w-full p-2 border border-gray-300 rounded-xl" value={forum} onChange={(e) => setForum(e.target.value)} required />
                                </div>
                                <div className='flex justify-center'>
                                    <button type="submit" className="w-1/2 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600" onClick={handleLogin}>
                                        Sign In
                                    </button>
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
                                    className="w-10 px-3 py-2 mb-4 mr-2 text-base text-black placeholder-gray-600 border rounded-lg focus:shadow-outline text-center"
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

export default LoginPage;
