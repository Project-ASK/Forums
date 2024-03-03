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
        setMembers(data.users.map(user => ({ name: user.name, username: user.username })));
      }
    };

    fetchUsers();
  }, [eventDetails]);

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
  const handleHome = () => {
    router.push('/admins/admindb');
}
  const deleteMember = (index) => {
    // Remove the member from the members array
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const handleLogout = () => {
    // Clear the cookies and redirect the user to the login page
    Cookies.remove('adminUsername');
    Cookies.remove('token');
    Cookies.remove('eventId');
    Cookies.remove('forum');
    router.replace('/adminAuth/login');
  }

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
          <img src="/assets/logo.png" width={200} onClick={handleback} />
          <button onClick={handleHome} className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem]">Dashboard</button>
        </div>
      </div>

      <div className="w-full flex flex-col items-center mt-10">
        {eventDetails &&
          <div className="w-1/2 p-4 border rounded-lg mb-4 bg-gray-300 flex">
            <div className="w-1/4 pr-2">
              <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, eventDetails.imagePath)} alt={eventDetails.eventName} width={100} height={100} />
            </div>
            <div className="w-1/2">
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
