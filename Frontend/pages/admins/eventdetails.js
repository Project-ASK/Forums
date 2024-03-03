import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { Menu, X } from 'react-feather';
import path from 'path'

const Dashboard = ({ username }) => {
  const [forum, setForum] = useState();
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [events, setEvents] = useState([]);
  const [ownEvents,setOwnEvents] = useState([]);


  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhoneNumber, setNewMemberPhoneNumber] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
const eventId = router.query.id

  const [members, setMembers] = useState([
    { name: 'John Doe', phoneNumber: '123-456-7890' },
    { name: 'Jane Smith', phoneNumber: '234-567-8901' },
    // add more members as needed
  ]);


  const addMember = () => {
    // Add the new member to the members array
    setMembers([...members, { name: newMemberName, phoneNumber: newMemberPhoneNumber }]);
  
    // Clear the input fields
    setNewMemberName('');
    setNewMemberPhoneNumber('');
  
    // Close the form
    setIsFormOpen(false);
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const members = lines.map((line) => {
        const [name, phoneNumber] = line.split(',');
        return { name, phoneNumber };
      });
      setMembers(members);
    };
  
    reader.readAsText(file);
  };

  const deleteMember = (index) => {
    // Remove the member from the members array
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

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

  const downloadMembers = () => {
    // Convert the members array to CSV data
    const csvData = members.map(member => `${member.name},${member.phoneNumber}`).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    return url;
  };
  
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
      </div>


        <div className="w-full flex flex-col items-center mt-10">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={index} className="w-1/2 p-4 border rounded-lg mb-4 bg-gray-300 flex">
                <div className="w-1/4 pr-2"> {/* Add some padding to the right of the image */}
                  <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, event.imagePath)} alt={event.eventName} width={100} height={100} />
                </div>
                <div className="w-1/2"> {/* Add some padding to the left of the text */}
                  <h2 className="text-lg font-bold">Name: {event.eventName}</h2> {/* Make the event name larger and bold */}
                  <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{event.date}</p> {/* Make the date smaller and gray */}
                  <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{event.time}</p> {/* Make the time smaller and gray */}
                  <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{event.location}</p> {/* Make the location smaller and gray */}
                  {event.collabForums.filter(forumName => forumName !== forum).length > 0 && (
                    <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{event.collabForums.filter(forumName => forumName !== forum).join(', ')}</p>
                  )}
                  <p className="text-md text-gray-500"><span className='font-bold'>Description: </span>{event.description}</p> {/* Make the description smaller and gray */}
                  <p className="text-md text-gray-500"><span className='font-bold'>Number of Participants: </span>{members.length}</p>

                </div>
                
              </div>
              
            ))
          ) : (
            <div className="w-1/2 p-4 border rounded mb-4 bg-gray-300">
              No events
            </div>
          )}

        </div>
        <div className="w-full flex flex-col items-center mt-10 overflow-auto" style={{ maxHeight: '300px' }}>
      <h2 className="text-2xl font-bold mb-5">Participants List</h2>
      <div className="w-full flex justify-center items-center mb-5">
        <button onClick={() => setIsFormOpen(true)} className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem]">Add Members</button>
        <input type="file" id="fileUpload" onChange={handleFileUpload} style={{ display: 'none' }} />
        <label htmlFor="fileUpload" className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem] cursor-pointer">Import</label>
        <a href={downloadMembers()} download="members.csv" className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem]">Download List</a>
      </div>
      {isFormOpen && (
        <div className="w-1/2 p-4 border rounded mb-4 flex justify-between items-center">
          <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Name" />
          <input type="text" value={newMemberPhoneNumber} onChange={(e) => setNewMemberPhoneNumber(e.target.value)} placeholder="Phone Number" />
          <button onClick={addMember} className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem]">Add</button>
        </div>
      )}
      {members.map((member, index) => (
        <div key={index} className="w-1/2 p-4 border rounded mb-4 flex justify-between items-center">
          <div>
            <span style={{ marginRight: '70px' }}>{member.name}</span>
            <span>{member.phoneNumber}</span>
          </div>
           <div>
            <input type="checkbox" id={`attendance-${index}`} name={`attendance-${index}`} />
            <button onClick={() => deleteMember(index)} className="p-2.5 bg-red-500 rounded-xl text-white ml-[1rem]">Delete</button>
          </div>       
           </div>
      ))}
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
