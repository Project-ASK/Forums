//Page to login into the forum
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import bcrypt from 'bcryptjs';
import Modal from 'react-modal';
import emailjs from '@emailjs/browser';


const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [realOtp, setRealOtp] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email.endsWith('@ceconline.edu')) {
            alert('Please use an email with domain @ceconline.edu');
            return;
        }
        const password = document.getElementById('password').value;
        var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        if (!password.match(passw)) {
            alert('Password is invalid');
            return;
        }
        const response = await fetch('http://localhost:3001/checkUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, username }),
        });
        const data = await response.json();
        if (data.message === 'A user already exists') {
            alert('A user with this email or username already exists');
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
    }

    const verifyOtp = async () => {
        if (otp === realOtp) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const response = await fetch('http://localhost:3001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, username, password: hashedPassword }),
            });
            const data = await response.json();
            if (data.message === 'Sign Up Successful') {
                alert('Sign Up Successful');
                setModalIsOpen(false);
            }
            else {
                alert(data.message);
            }
        } else {
            alert('Incorrect OTP. Please try again.');
            setOtp('');
        }
    }
    const handleModalClose = () => {
        if (otp === realOtp) {
            setIsVerified(true);
        }
    }
    useEffect(() => {
        if (isVerified) {
            router.replace('/login');
        }
    }, [isVerified]);

    return (
        <>
            <div className="flex h-screen items-center justify-center lg:justify-start" style={{ backgroundImage: 'url("/assets/back.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-full absolute top-2">
                    <h1 className="text-2xl font-semibold  text-left ml-8">Forum Management</h1>
                </div>
                {/* Left Part - Image covering the whole page */}
                <div className="hidden lg:flex lg:flex-1">
                </div>

                {/* Right Part - Centered Login Form above the image */}
                <div className="max-w-md bg-white p-8 rounded-2xl shadow-md mx-auto sm:w-full sm:max-w-md lg:mr-32 lg:w-1/4 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                    <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>

                    {/* Signup Form */}
                    <form>

                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Name</label>
                            <input type="text" id="name" name="name" placeholder="Enter name here" className="w-full p-2 border border-gray-300 rounded" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-600 text-sm mb-2">Email</label>
                            <input type="email" id="email" name="email" placeholder="Enter email here" className="w-full p-2 border border-gray-300 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-600 text-sm mb-2">Username</label>
                            <input type="text" id="username" name="username" placeholder="Enter username here" className="w-full p-2 border border-gray-300 rounded" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Password</label>
                            <input type="password" id="password" name="password" placeholder="Enter password" className="w-full p-2 border border-gray-300 rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className='flex justify-center'>
                            <button type="submit" className="w-[50%] bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" onClick={handleSignUp}>
                                Sign Up
                            </button>
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
                        <div className="relative p-6 flex-auto">
                            <input
                                type="text"
                                maxLength='6'
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-3 py-2 mb-4 text-base text-black placeholder-gray-600 border rounded-lg focus:shadow-outline"
                                placeholder="Enter OTP"
                                autoFocus
                            />
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
