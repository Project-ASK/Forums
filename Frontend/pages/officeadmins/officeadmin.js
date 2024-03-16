import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { Menu, X } from 'react-feather';
import path from 'path'

const OfficeAdmins = ({ username }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const node = useRef();

  const handleClickOutside = e => { // Add this function
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click 
    setIsOpen(false);
  };

  useEffect(() => { // Add this useEffect
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/office/getDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setName(data.name);
      setEmail(data.email);
    };
    fetchDetails();
  }, [username]);

  const handleHomeClick = () => {
    router.reload();
  }

  const handleLogout = () => {
    // Clear the cookies and redirect the user to the login page
    Cookies.remove('officeUsername');
    Cookies.remove('token');
    router.replace('/officeadmins/login');
  }

  if (!username) {
    return null;
  }

  return (
    <>
      <div className="App">
        <div className="flex flex-row items-center bg-white justify-center w-full">
          <img src="/assets/logo.png" width={150} onClick={handleHomeClick} className='cursor-pointer xs:w-[7.9rem]' />
          <div className="w-[40%] flex flex-col items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[20px] mt-[30px] mb-4">
            <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg">Welcome, {name}</p>
          </div>
          <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 rounded-3xl text-white">
              <img src="/assets/officeadmins/notifications.png" width={40} alt="Notifications" />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 py-2 bg-white border rounded shadow-xl overflow-auto max-h-64 z-30">
                <a href="#" className="transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-purple-500 hover:text-white">Notification 1</a>
                <a href="#" className="transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-purple-500 hover:text-white">Notification 2</a>
                <a href="#" className="transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-purple-500 hover:text-white">Notification 3</a>
                {/* ... more notifications ... */}
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-blue-500 rounded-3xl text-white">Logout</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0.5 p-2 h-screen mt-[2rem] w-[80%] mx-auto">
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { }}>
            <img src="/assets/logo.png" width={200} alt="Forums" />
            <p>Forums</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { }}>
            <img src="/assets/officeadmins/reporticon.png" width={200} alt="Reports" />
            <p>Reports</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { }}>
            <img src="/assets/officeadmins/gallery.png" width={200} alt="Gallery" />
            <p>Gallery</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { }}>
            <img src="/assets/officeadmins/chat.png" width={200} alt="Connect Admins" />
            <p>Connect Admins</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { }}>
            <img src="/assets/officeadmins/pending-approval.png" width={200} alt="Pending Approvals" />
            <p>Pending Approvals</p>
          </div>
        </div>
      </div>
    </>
  );

};
export async function getServerSideProps(context) {
  // Get username from cookies
  const username = context.req.cookies.officeUsername;

  // If username is not available, redirect to login
  if (!username) {
    return {
      redirect: {
        destination: '/officeadmins/login',
        permanent: false,
      },
    }
  }

  // If username is available, pass it as a prop
  return {
    props: { username },
  }
}

export default OfficeAdmins;
