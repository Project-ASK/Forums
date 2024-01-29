//Entering email page

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import emailjs from '@emailjs/browser';

const Sign = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        router.push('/sign');
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email.endsWith('@ceconline.edu')) {
            alert('Please use an email with domain @ceconline.edu');
            return;
        }
        emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID, process.env.NEXT_PUBLIC_TEMPLATE_ID, { email }, process.env.NEXT_PUBLIC_PUBLIC_KEY)
            .then((result) => {
                console.log(result.text);
            }, (error) => {
                console.log(error.text);
            });
        router.push('/signInstr');
    }

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

                    {/* Login Form */}
                    <form>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-600 text-sm mb-2">Enter the Email</label>
                            <input type="email" id="email" name="email" className="w-full p-2 border border-gray-300 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className='flex justify-center mt-4 mb-4'>
                            <span className='text-md text-black block text-right mt-4'>Already Registered?&nbsp;</span><a href="#" className="text-md font-medium text-blue-500 hover:text-blue-600 hover:underline block text-right mt-4" onClick={handleLogin}>Log In</a>
                        </div>

                        <div className='flex justify-center'>
                            <button type="submit" className="w-[50%] bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" onClick={handleSubmit}>
                                Submit
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
        </>
    );
};

export default Sign;
