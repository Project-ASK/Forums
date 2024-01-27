import React from 'react';
import { useRouter } from 'next/router';

const dev = () => {
  alert("This feature is under development");
}

const LoginPage = () => {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    if (!email.endsWith('@ceconline.edu')) {
      alert('Please use an email with domain @ceconline.edu');
      return;
    }
    router.push('/login');
  }

  const handleSignUp = (e) => {
    e.preventDefault();
    router.push('/sign');
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
          <h2 className="text-2xl font-semibold mb-4">Login</h2>

          {/* Login Form */}
          <form>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600 text-sm mb-2">Email</label>
              <input type="email" id="email" name="email" className="w-full p-2 border border-gray-300 rounded" />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-600 text-sm mb-2">Password</label>
              <input type="password" id="password" name="password" className="w-full p-2 border border-gray-300 rounded" />
              {/* //forgot password */}
              <a href="#" className="text-md text-blue-500 font-medium hover:text-blue-600 hover:underline block text-right mt-4" onClick={dev}>Forgot Password?</a>
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
    </>
  );
};

export default LoginPage;
