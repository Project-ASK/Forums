import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { Menu, X } from 'react-feather';

const Dashboard = ({ username }) => {
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
        setEvents(dataEvents.events);
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
    toggleMenu();
    setCurrentPage('home');
  };

  const handleManageEventsClick = () => {
    toggleMenu();
    setCurrentPage('manageEvents');
  };

  if (!username) {
    return null;
  }

  return (
    <>
      <div className="App">
        <div className="flex bg-white w-full justify-between items-center">
          <button onClick={toggleMenu} className="p-4">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img src="/assets/logo.png" width={200} />
          <button onClick={handleLogout} className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem]">Logout</button>
        </div>
        {isMenuOpen && (
          <div className="absolute top-0 left-0 w-1/6 h-full bg-white flex flex-col p-4 transition-transform duration-200 transform translate-x-0">
            <button onClick={toggleMenu} className="mb-4 self-end">
              <X size={24} />
            </button>
            <ul>
              <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleHomeClick}>Home</li>
              <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleMemberListClick}>Member List</li>
              <li className="p-2 border rounded mb-2 cursor-pointer" onClick={() => { }}>Analytics</li>
              <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleManageEventsClick}>Manage Events</li>
            </ul>
          </div>
        )}
      </div>

      {currentPage === 'memberList' ? (
        // If showMembers is true, display the list of members
        <div className="w-full flex flex-col items-center mt-10">
          <h2 className="text-2xl font-bold mb-5">Members of {forum}:</h2>
          {members.map((member, index) => (
            <div key={index} className="w-1/2 p-4 border rounded mb-4">
              {member.name}
            </div>
          ))}
        </div>
      ) : currentPage === 'manageEvents' ? (
        <div className="w-full flex flex-col items-center mt-10">
          <button className="p-2.5 bg-blue-500 rounded-xl text-white mb-4" onClick={() => { router.push('createEvent') }}>Create Event</button>
            {events.length > 0 ? (
              events.map((event, index) => (
                <div key={index} className="w-1/2 p-4 border rounded-lg mb-4 bg-gray-300 flex">
                  <div className="w-1/4 pr-2"> {/* Add some padding to the right of the image */}
                    <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.imagePath}`} alt={event.eventName} width={100} height={100} />
                  </div>
                  <div className="w-1/2"> {/* Add some padding to the left of the text */}
                    <h2 className="text-lg font-bold">Name: {event.eventName}</h2> {/* Make the event name larger and bold */}
                    <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{event.date}</p> {/* Make the date smaller and gray */}
                    <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{event.time}</p> {/* Make the time smaller and gray */}
                    <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{event.location}</p> {/* Make the location smaller and gray */}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-1/2 p-4 border rounded mb-4 bg-gray-300">
                No events
              </div>
            )}

        </div>
      ) : (
        // If showMembers is false, display the default content
        <>
          <div className="flex bg-white w-full">
          </div>
          <div className="w-full flex pb-[40px] justify-center" style={{ backgroundImage: 'url("/assets/bgprofile.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="flex-col  xs:w-3/4 md:w-1/2  flex items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[70px] mt-[30px]">
              <img src="/assets/profile.svg" width={150} className="self-center" />
              <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg mt-[30px]">Welcome, {name}</p>
            </div>
          </div>
        </>
      )}
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

export default Dashboard;