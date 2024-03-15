import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { Menu, X } from 'react-feather';
import path from 'path'

const officeadmins = ({ username }) => {
  const [forum, setForum] = useState();
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [events, setEvents] = useState([]);
  const [ownEvents, setOwnEvents] = useState([]);
  const node = useRef();

  useEffect(() => {
    const page = Cookies.get('currentPage'); // Get the currentPage from the cookie
    if (page) {
      setCurrentPage(page);
      Cookies.remove('currentPage'); // Remove the cookie
    }
  }, []);


  const handleClickOutside = e => { // Add this function
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click 
    setIsMenuOpen(false);
  };

  useEffect(() => { // Add this useEffect
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  useEffect(() => {
    const fetchForums = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getForums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setForum(data.forum);
      setName(data.name);
      setEmail(data.email);
    };
    fetchForums();
  }, [username]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (forum) {
        const responseEvents = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getEvents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ forum }),
        });
        const dataEvents = await responseEvents.json();
        setOwnEvents(dataEvents.events);
      }
    };

    fetchEvents();
  }, [forum]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (forum) {
        const responseEvents = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getCollabEvents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ forum }),
        });
        const dataCollabEvents = await responseEvents.json();
        const collabEvents = dataCollabEvents.events;
        setEvents([...ownEvents, ...collabEvents]);
      }
    };

    fetchEvents();
  }, [forum]);


  const handleLogout = () => {
    // Clear the cookies and redirect the user to the login page
    Cookies.remove('adminUsername');
    Cookies.remove('token');
    router.replace('/adminAuth/login');
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleMemberListClick = async () => {
    toggleMenu();
    setCurrentPage('memberList');
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getOrganizationMembers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ org: forum }),
    });
    const data = await response.json();
    setMembers(data.users);
    setShowMembers(true);
  };

  const handleHomeClick = () => {
    if (isMenuOpen) {
      toggleMenu();
    }
    setCurrentPage('home');
  };

  const handleManageEventsClick = () => {
    toggleMenu();
    setCurrentPage('manageEvents');
  };

  const handleAnalytics = () => {
    router.push('/admins/analytics')
  }


  // This would be in your React component
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const members = lines.map((line) => {
        const [name, id] = line.split(',');
        return { name, id: id ? id.trim() : undefined };
      });

      // Send a POST request to your server-side route with the new member data
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/appendMembers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forum, members }),
      });

      if (response.ok) {
        console.log('Members appended successfully');
      } else {
        console.log('Failed to append members');
      }
    };

    reader.readAsText(file);
  };
  
  if (!username) {
    return null;
  }
  return (
    <>
      <div className="App">
        <div className="flex bg-white w-full justify-between items-center">
          <img src="/assets/logo.png" width={200} onClick={handleHomeClick} className='cursor-pointer' />
          <div className="flex-col xs:w-3/8  md:w-1/2 flex items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[20px] mt-[10px]">
            <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg mt-[30px]">Welcome, {name}</p>
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-blue-500 rounded-3xl text-white mr-[1rem]">Logout</button>
        </div>
        <div className="grid grid-cols-4 gap-0.5 p-2 place-items-center h-screen">
          <div className="flex flex-col items-center justify-center p-4 border rounded cursor-pointer transform hover:scale-105 transition-transform duration-200" onClick={handleHomeClick}>
            <img src="/assets/logo.png" width={200} alt="Forums" />
            <p>Forums</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded cursor-pointer transform hover:scale-105 transition-transform duration-200" onClick={handleMemberListClick}>
            <img src="/assets/officeadmins/reporticon.png" width ={200} alt="Reports" />
            <p>Reports</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded cursor-pointer transform hover:scale-105 transition-transform duration-200" onClick={handleAnalytics}>
            <img src="/assets/officeadmins/gallery.png" width={200} alt="Gallery" />
            <p>Gallery</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded cursor-pointer transform hover:scale-105 transition-transform duration-200" onClick={handleManageEventsClick}>
            <img src="/assets/officeadmins/chat.png" width={200} alt="Connect Admins" />
            <p>Connect Admins</p>
          </div>
        </div>
      </div>
    </>
  );
  
 };
export async function getServerSideProps(context) {
  // Get username from cookies
  const username = context.req.cookies.adminUsername;

  // If username is not available, redirect to login
  if (!username) {
    return {
      redirect: {
        destination: '/adminAuth/login',
        permanent: false,
      },
    }
  }

  // If username is available, pass it as a prop
  return {
    props: { username },
  }
}

export default officeadmins;
