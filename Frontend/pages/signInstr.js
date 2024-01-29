//Page to show dialogue box to instruct user to check email for sign-up instructions    
import React from 'react';

const SignInstr = () => {
    return (
        <>
            <div className="flex h-screen items-center justify-center" style={{ backgroundImage: 'url("/assets/back.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-full absolute top-2">
                    <h1 className="text-2xl font-semibold  text-left ml-8">Forum Management</h1>
                </div>
                <div className="max-w-md bg-white p-8 rounded-2xl shadow-md mx-auto sm:w-full sm:max-w-md lg:w-1/4 bg-opacity-70 backdrop-filter backdrop-blur-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up Instructions</h2>
                    <p className="text-md text-gray-600 mb-4">Instructions for sign-up have been sent to your email. Please check your inbox and follow the steps to complete the sign-up process.</p>
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

export default SignInstr;
