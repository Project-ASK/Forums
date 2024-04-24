import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import path from 'path'
import { ToastContainer, Bounce, toast } from 'react-toastify';
import { Box, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = ({ username }) => {
  const router = useRouter();
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhoneNumber, setNewMemberPhoneNumber] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [guestUsers, setGuestUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [feedbacks, setFeedbacks] = useState(false);
  const [eventFeedbacks, setEventFeedbacks] = useState(null);

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
      setEventFeedbacks(data.event.feedbacks);
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  useEffect(() => {
    const fetchGuestUsers = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getGuestUsers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await response.json();
      setGuestUsers(data.guestUsers)
    };

    if (eventId) {
      fetchGuestUsers();
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
        setMembers(data.users.map(user => {
          // Find the joinedEvent for the current event
          const joinedEvent = user.joinedEvents.find(je => je.eventName === eventDetails.eventName);
          // If the joinedEvent exists, use its isAttended status, otherwise default to false
          const isAttended = joinedEvent ? joinedEvent.isAttended : false;

          return {
            name: user.name,
            username: user.username,
            phoneNumber: user.phoneNumber,
            isAttended
          };
        }));
        const mergedParticipants = [...members, ...guestUsers];
        setParticipants(mergedParticipants);
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
      const newMembers = members.map((m, i) => {
        // For the member whose attendance status has changed, return a new object
        if (i === index) {
          return { ...m, isAttended: attended };
        }
        // For all other members, return the original object
        return m;
      });
      setMembers(newMembers);
    } else {
      toast.error('User does not exist', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
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
          toast.error(`User ${member.name} does not exist`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
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
      toast.error('Failed to remove user', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const deleteGuestMember = async (index) => {
    // Get the member to be deleted
    const member = guestUsers[index];

    // Remove the member from the event in the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/removeGuestFromEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: member.name, event: eventDetails.eventName }),
    });

    const data = await response.json();

    // If the user was removed successfully, remove the member from the members array
    if (data.success) {
      const newMembers = [...guestUsers];
      newMembers.splice(index, 1);
      setGuestUsers(newMembers);
      toast.success('User removed successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      toast.error('Failed to remove user', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
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

  useEffect(() => {
    const mergedParticipants = [...members, ...guestUsers];
    setParticipants(mergedParticipants);
  }, [members, guestUsers]);

  const downloadMembers = () => {
    // Convert the members array to CSV data
    const csvData = participants.map(member => `${member.name},${member.phoneNumber}`).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    return url;
  };

  const handleAttendanceChange = async (index, attended) => {
    // Get the member whose attendance status has changed
    const member = members[index];
    // Send a request to the backend to update the user's attendance status
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateAttendanceStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: member.name, event: eventDetails.eventName, attended }),
    });

    const data = await response.json();

    // If the user's attendance status was updated successfully, update the members array
    if (data.success) {
      const newMembers = [...members];
      newMembers[index].isAttended = attended;
      setMembers(newMembers);
      toast.success('Attendance updated successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      toast.error('Failed to update attendance status', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const handleGuestAttendanceChange = async (index, attended) => {
    // Get the member whose attendance status has changed
    const member = guestUsers[index];
    // Send a request to the backend to update the user's attendance status
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateGuestAttendanceStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: member.name, event: eventDetails.eventName, attended }),
    });

    const data = await response.json();

    // If the user's attendance status was updated successfully, update the members array
    if (data.success) {
      const newMembers = [...guestUsers];
      newMembers[index].isAttended = attended;
      setGuestUsers(newMembers);
      toast.success('Attendance updated successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      toast.error('Failed to update attendance status', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const handleback = () => {
    router.back();
  }

  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle changes in the search input field
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter the members array based on the search query
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuestMembers = guestUsers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ToastContainer />
      <div className="App">
        <div className="flex bg-white w-full justify-between items-center">
          <img src="/assets/logo.png" width={200} onClick={handleback} className='cursor-pointer' />
        </div>
      </div>
      <div className="w-full flex flex-col items-center mt-10">
        {eventDetails &&
          <div className="w-[80%] md:w-3/4 lg:w-2/3 p-4 border rounded-lg mb-4 bg-gray-300 flex flex-col md:flex-row items-center">
            <div className="md:w-1/6 pr-2">
              <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, eventDetails.eventImagePath)} alt={eventDetails.eventName} width={100} height={100} layout="responsive" />
            </div>
            <div className="xs:mt-2 lg:mt-0 md:w-3/4 md:ml-[1rem]">
              <h2 className="text-lg font-bold">Name: {eventDetails.eventName}</h2>
              <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{eventDetails.date}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{eventDetails.time}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{eventDetails.location}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Description: </span>{eventDetails.description}</p>
              <p className="text-md text-gray-500"><span className='font-bold'>Number of Participants: </span>{participants.length}</p>
              {eventDetails && eventDetails.collabForums.filter(forumName => forumName !== forum).length > 0 && (
                <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{eventDetails.collabForums.filter(forumName => forumName !== forum).join(', ')}</p>
              )}
            </div>
          </div>
        }
      </div>
      <div className="w-full flex flex-col flex-wrap items-center mt-10 overflow-auto">
        <h2 className="text-2xl font-bold mb-5">Participants List</h2>
        <div className="rounded-md shadow-sm flex items-center" role="group">
          <button
            type="button"
            className="p-2.5 bg-blue-700 rounded-full text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setIsFormOpen(true)}
          >
            Add Members
          </button>
          <input type="file" id="fileUpload" onChange={handleFileUpload} style={{ display: 'none' }} />
          <label htmlFor="fileUpload" className="p-2.5 bg-green-700 rounded-full text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer">
            Import
          </label>
          <button
            type="button"
            className="p-2.5 bg-red-700 rounded-full text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            <a href={downloadMembers()} download="members.csv">Download List</a>
          </button>
          <button
            type="button"
            className="p-2.5 bg-purple-700 rounded-full text-white hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
            onClick={() => { Cookies.set('eventId', eventDetails._id); Cookies.set('participants', participants.length); router.push('./eventReport') }}
          >
            Generate Event Report
          </button>
          <button
            type="button"
            className="ml-2 p-2.5 bg-blue-700 rounded-full text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium text-sm px-5 py-2.5 text-center mb-2 dark:focus:ring-purple-900"
            onClick={() => { setFeedbacks(true) }}
          >
            Feedbacks
          </button>
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
        {feedbacks && (
          <Dialog
            open={feedbacks}
            onClose={() => { setFeedbacks(false) }}
            PaperProps={{
              style: {
                backgroundColor: '#f5f5f5',
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle style={{ textAlign: 'center', color: '#3f51b5' }}>Feedbacks</DialogTitle>
            <DialogContent>
              {eventFeedbacks && eventFeedbacks.map((feedback, index) => (
                <Box
                  key={index}
                  sx={{
                    border: '1px solid #ddd', // Border around the feedback
                    borderRadius: '5px', // Rounded corners for the feedback box
                    padding: '10px', // Padding inside the feedback box
                    marginBottom: '10px', // Space between feedback boxes
                    overflow: 'auto', // Set overflow to auto
                  }}
                >
                  <Typography component="p" variant="body1" style={{ fontStyle: 'italic' }}>
                    "{feedback.feedback}" - <strong>{feedback.name}</strong>
                  </Typography>
                </Box>
              ))}
            </DialogContent>
          </Dialog>
        )}

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg lg:w-[60%] xs:w-full mt-[2rem]">
          <div className="pb-3 bg-white">
            <div className="relative mt-1">
              <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="table-search"
                className="block pt-3 pb-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for members"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-900 border-b uppercase bg-gray-50 ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Check In
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr key={index} className="bg-white border-b  dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-300">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{member.phoneNumber}</td>
                  <td className="px-6 py-4">
                    <label htmlFor={`attendance-${index}`} className="mr-[1rem] text-gray-700">Check In</label>
                    <input type="checkbox" id={`attendance-${index}`} name={`attendance-${index}`} checked={member.isAttended} onChange={(e) => handleAttendanceChange(index, e.target.checked)} />
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button onClick={() => deleteMember(index)} className="font-medium text-blue-600 dark:text-blue hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {guestUsers && filteredGuestMembers.map((member, index) => (
                <tr key={index} className="bg-white border-b  dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-300">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {member.name} (Guest)
                  </td>
                  <td className="px-6 py-4 text-gray-700">{member.phoneNumber}</td>
                  <td className="px-6 py-4">
                    <label htmlFor={`attendance-${index}`} className="mr-[1rem] text-gray-700">Check In</label>
                    <input type="checkbox" id={`attendance-${index}`} name={`attendance-${index}`} checked={member.isAttended} onChange={(e) => handleGuestAttendanceChange(index, e.target.checked)} />
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button onClick={() => deleteGuestMember(index)} className="font-medium text-blue-600 dark:text-blue hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
