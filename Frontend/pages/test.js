import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const LoginPage = ({ username }) => {
  const [forums, setForums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchForums = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getForums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setForums(data.forums);
      setName(data.name);
    };

    fetchForums();
  }, [username]);

  const handleLogout = () => {
    // Clear the cookies and redirect the user to the login page
    Cookies.remove('username');
    Cookies.remove('token');
    router.replace('/login');
  }

  // If username is not available, don't render anything
  if (!username) {
    return null;
  }

  return (
    <>
      <div className="flex h-screen items-center justify-center lg:justify-start" style={{ backgroundImage: 'url("/assets/back.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-full absolute top-2 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-left ml-8">Forum Management</h1>
          <div className="relative">
            <div className='bg-blue-300 rounded-lg'>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-black py-1 px-4 rounded">
                Welcome, {name}
              </button>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg">
                <div className="py-1">
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-24 left-14 flex justify-between items-center w-[93%]">
          <h2 className="text-2xl font-semibold">Your Organizations</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">+ Add Organization</button>
        </div>
        <div className="mb-48 mx-5 w-3/5 ml-auto mr-auto">
          <div className="flex flex-col items-center gap-4">
            {forums.map((forum, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-2xl bg-white w-full">
                {forum}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  // Get username from cookies
  const username = context.req.cookies.username;

  // If username is not available, redirect to login
  if (!username) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  // If username is available, pass it as a prop
  return {
    props: { username }, // will be passed to the page component as props
  }
}

export default LoginPage;
