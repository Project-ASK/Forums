import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CancelIcon from '@mui/icons-material/Cancel';
import { Menu, X } from 'react-feather';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import path from 'path'

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

  useEffect(() => {
    if (isMenuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, [isMenuOpen]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <div className="App">
            <div className="flex bg-white w-full justify-between items-center">
              <button onClick={toggleMenu} className="p-4">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <img src="/assets/logo.png" width={200} onClick={handleHomeClick} className='cursor-pointer' />
              <button onClick={handleLogout} className="p-2.5 bg-blue-500 rounded-3xl text-white mr-[1rem]">Logout</button>
            </div>
            {isMenuOpen && (
              <div ref={node} className={`absolute top-0 left-0 lg:w-1/6 xs:w-full h-full bg-white flex flex-col p-4 transition-transform ease-in-out duration-500 ${isMenuOpen ? 'animate-slide-in' : '-translate-x-full'}`}>
                <div className="flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={()=>{setSide('Home')}}>
                   <img src="/assets/home.svg" className="ml-[30px]" width={20}/>
                  <p className="font-sans text-md">Home</p>
                </div>
                <div className="flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 rounded-lg" onClick={()=>{setSide('Analytics')}}>
                  <img src="/assets/stats.svg" className="ml-[30px]" width={20}/>
                  <p className="font-sans text-md">Analytics</p>
                </div>
                {/*<ul>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleHomeClick}>Home</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleMemberListClick}>Member List</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleAnalytics}>Analytics</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleManageEventsClick}>Manage Events</li>
                </ul>*/}
              </div>
            )}
          </div>

          {currentPage === 'memberList' ? (
            // If showMembers is true, display the list of members
            <div className="w-full flex flex-col items-center mt-10">
              <input type="file" id="fileUpload" onChange={handleFileUpload} style={{ display: 'none' }} />
              <label htmlFor="fileUpload" className="p-2.5 bg-blue-500 rounded-full text-white mr-[1rem] mb-[1rem] cursor-pointer w-[6rem] text-center">Import</label>
              <h2 className="text-2xl font-bold mb-5">Members of {forum}:</h2>
              {members.map((member, index) => (
                <div key={index} className="w-1/2 p-4 border rounded mb-4">
                  {member.name}
                </div>
              ))}
            </div>
          ) : currentPage === 'manageEvents' ? (
            <Grid item xs={12}>
              <div className="lg:w-full flex flex-col items-center mt-10 xs:w-[70%] mx-auto">
                <button className="p-2.5 bg-blue-500 rounded-full text-white mb-4" onClick={() => { router.push('createEvent') }}>Create Event</button>
                {events && events.length > 0 ? (
                  events.map((event, index) => (
                    <div key={index} className="w-full md:w-3/4 lg:w-2/3 p-4 border rounded-lg mb-4 bg-gray-300 flex flex-col md:flex-row items-center" onClick={() => {
                      Cookies.set('eventId', event._id); // Set the event id as a cookie
                      router.push(`/admins/eventdetails`); // Navigate to the eventdetails page
                    }}>
                      <div className="md:w-1/6 pr-2">
                        <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, event.imagePath)} alt={event.eventName} width={100} height={100} layout="responsive" />
                      </div>
                      <div className="xs:mt-2 lg:mt-0 md:w-3/4 cursor-pointer md:ml-[1rem]">
                        <h2 className="text-lg font-bold">{event.eventName}</h2>
                        <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{event.date}</p>
                        <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{event.time}</p>
                        <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{event.location}</p>
                        {event.collabForums.filter(forumName => forumName !== forum).length > 0 && (
                          <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{event.collabForums.filter(forumName => forumName !== forum).join(', ')}</p>
                        )}
                      </div>
                      <div className="w-full md:w-1/4 flex justify-end items-center mt-4 md:mt-0">
                        <Chip
                          icon={
                            event.isApproved === 'Approved' ? <CheckCircleIcon /> :
                              event.isApproved === 'Pending' ? <HourglassBottomIcon /> :
                                <CancelIcon />
                          }
                          label={event.isApproved}
                          color={event.isApproved === 'Approved' ? 'success' : event.isApproved === 'Pending' ? 'warning' : 'error'}
                        />
                        <EditOutlinedIcon className="cursor-pointer ml-2" onClick={(e) => {
                          e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                          // Add your edit event handler here
                        }} />
                        <DeleteRoundedIcon className="cursor-pointer ml-3" onClick={(e) => {
                          e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                          // Add your delete event handler here
                        }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full p-4 border rounded mb-4 bg-gray-300">
                    No events
                  </div>
                )}
              </div>
            </Grid>
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
        </div>
        <footer className="text-gray-600 body-font">
          <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
            <div className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
              <img src="/assets/authlogo.png" width={90} />
              <span className="ml-3 text-xl">Forums CEC</span>
            </div>
            <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">© 2024 Forums CEC</p>
          </div>
        </footer>
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

export default Dashboard;
