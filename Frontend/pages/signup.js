import React, { useState } from 'react';
import { useRouter } from 'next/router';
import bcrypt from 'bcryptjs';


const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email.endsWith('@ceconline.edu')) {
            alert('Please use an email with domain @ceconline.edu');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const response = await fetch('http://localhost:3001/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, username, password: hashedPassword}),
        });
        const data = await response.json();
        if (data.message === 'Sign Up Successful') {
            router.push('/login');
        }
        else {
            alert(data.message);
        }
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
        </>
    );
};

export default SignUpPage;
