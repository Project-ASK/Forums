import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import path from 'path'

const Dashboard = ({ username }) => {
  const router = useRouter();
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhoneNumber, setNewMemberPhoneNumber] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [members, setMembers] = useState([]);

  const eventId = Cookies.get('eventId');
  const forum = Cookies.get('forum');

  useEffect(() => {
    const fetchEventDetails = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getEventDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await response.json();
      setEventDetails(data.event);
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (eventDetails) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/getUsers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventName: eventDetails.eventName }),
        });
        const data = await response.json();

        // Set the members state
        setMembers(data.users.map(user => ({ name: user.name, username: user.username, phoneNumber: user.phoneNumber })));
      }
    };

    fetchUsers();
  }, [eventDetails]);

  const addMember = async () => {
    // Check if the user exists and update the user in the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/checkAndUpdateUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newMemberName, event: eventDetails.eventName, forumName: forum }),
    });

    const data = await response.json();

    // If the user was updated successfully, add the new member to the members array
    if (data.success) {
      setMembers([...members, { name: newMemberName, phoneNumber: newMemberPhoneNumber }]);
    } else {
      alert('User does not exist');
    }

    // Clear the input fields
    setNewMemberName('');
    setNewMemberPhoneNumber('');

    // Close the form
    setIsFormOpen(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const members = lines.map((line) => {
        const [name, phoneNumber, forumName] = line.split(',');
        return { name, phoneNumber, forumName };
      });

      for (const member of members) {
        // Send a request to the backend to check and update the user
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/checkAndUpdateUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: member.name, event: eventDetails.eventName, forumName }),
        });

        const data = await response.json();

        // If the user was updated successfully, add the new member to the members array
        if (data.success) {
          setMembers(prevMembers => [...prevMembers, member]);
        } else {
          alert(`User ${member.name} does not exist`);
        }
      }
    };

    reader.readAsText(file);
  };

  const deleteMember = async (index) => {
    // Get the member to be deleted
    const member = members[index];

    // Remove the member from the event in the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/removeUserFromEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: member.name, event: eventDetails.eventName }),
    });

    const data = await response.json();

    // If the user was removed successfully, remove the member from the members array
    if (data.success) {
      const newMembers = [...members];
      newMembers.splice(index, 1);
      setMembers(newMembers);
    } else {
      alert('Failed to remove user');
    }
  };

  useEffect(() => {
    const handleBackButtonEvent = (e) => {
      e.preventDefault();
      Cookies.set('currentPage', 'manageEvents'); // Set the currentPage in a cookie
      router.push('/admins/admindb');
    };

    window.addEventListener('popstate', handleBackButtonEvent);

    return () => {
      window.removeEventListener('popstate', handleBackButtonEvent);
    };
  }, []);

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

  const handleback = () => {
    router.back();
  }

  return (
    <>
      <div className="App">
        <div className="flex bg-white w-full justify-between items-center">
          <img src="/assets/logo.png" width={200} onClick={handleback} className='cursor-pointer' />
        </div>
      </div>
      <div className="w-full flex flex-col items-center mt-10">
        {eventDetails &&
          <div className="w-1/2 p-4 border rounded-lg mb-4 bg-gray-300 flex">
            <div className="w-1/6 pr-2">
              <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, eventDetails.imagePath)} alt={eventDetails.eventName} width={100} height={100} layout="responsive" />
            </div>
            <div className="w-1/2 ml-[1rem]">
              <h2 className="text-lg font-bold">Name: {eventDetails.eventName}</h2>
              <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{eventDetails.date}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{eventDetails.time}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{eventDetails.location}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Description: </span>{eventDetails.description}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Number of Participants: </span>{members.length}</p>
              {eventDetails.collabForums.filter(forumName => forumName !== forum).length > 0 && (
                <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{eventDetails.collabForums.filter(forumName => forumName !== forum).join(', ')}</p>
              )}
            </div>
          </div>
        }
      </div>
      <div className="w-full flex flex-col items-center mt-10 overflow-auto" style={{ maxHeight: '300px' }}>
        <h2 className="text-2xl font-bold mb-5">Participants List</h2>
        <div className="w-full flex justify-center items-center mb-5">
          <button onClick={() => setIsFormOpen(true)} className="p-2.5 bg-blue-500 rounded-full text-white mr-[1rem]">Add Members</button>
          <input type="file" id="fileUpload" onChange={handleFileUpload} style={{ display: 'none' }} />
          <label htmlFor="fileUpload" className="p-2.5 bg-blue-500 rounded-full text-white mr-[1rem] cursor-pointer">Import</label>
          <a href={downloadMembers()} download="members.csv" className="p-2.5 bg-blue-500 rounded-full text-white mr-[1rem]">Download List</a>
          <button onClick={() => { Cookies.set('eventId', eventDetails._id); router.push('./eventReport') }} className="p-2.5 bg-blue-500 rounded-full text-white">Generate Event Report</button>
        </div>
        {isFormOpen && (
          <div className="w-1/2 p-4 border rounded mb-4 flex justify-between items-center">
            <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Name" />
            <input type="text" value={newMemberPhoneNumber} onChange={(e) => setNewMemberPhoneNumber(e.target.value)} placeholder="Phone Number" />
            <div>
              <button onClick={addMember} className="p-2.5 bg-blue-500 rounded-2xl text-white mr-[1rem]">Add</button>
              <button onClick={() => { setIsFormOpen(false) }} className="p-2.5 bg-red-500 rounded-2xl text-white">Close</button>
            </div>
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
              <button onClick={() => deleteMember(index)} className="p-2.5 bg-red-500 rounded-full text-white ml-[1rem]">Delete</button>
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
  const eventId = context.req.cookies.eventId;

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
    props: { username, eventId },
  }
}

export default Dashboard;
