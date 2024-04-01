import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import CreatableSelect from 'react-select/creatable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CancelIcon from '@mui/icons-material/Cancel';
import { Menu, X } from 'react-feather';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import path from 'path'
import Chat from './Chat/chat'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [eventEditModal, setEventEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [messages, setMessages] = useState([]);
  const node = useRef();

  const nodeNotifications = useRef(); // Create a new useRef for notifications

  const handleClickOutsideNotifications = e => { // Define handleClickOutsideNotifications function
    if (nodeNotifications.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click 
    setIsOpen(false);
  };

  useEffect(() => { // Add useEffect for notifications
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutsideNotifications);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideNotifications);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideNotifications);
    };
  }, [isOpen]);

  useEffect(() => {
    const page = Cookies.get('currentPage'); // Get the currentPage from the cookie
    if (page) {
      setCurrentPage(page);
      Cookies.remove('currentPage'); // Remove the cookie
    }
  }, []);


  const handleClickOutside = e => { // Add this function
    if (node.current.contains(e.target)) {
      // inside clickconst nodeNotifications = useRef(); // Create a new useRef for notifications

      const handleClickOutsideNotifications = e => { // Define handleClickOutsideNotifications function
        if (nodeNotifications.current.contains(e.target)) {
          // inside click
          return;
        }
        // outside click 
        setIsOpen(false);
      };
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
      Cookies.set('adminId', data.adminId);
      setAdminId(Cookies.get('adminId'));
      Cookies.set('forum', data.forum);
    };
    fetchForums();
  }, [username]);

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/chatHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });
      const data = await response.json();

      const allMessages = data.chatByDate.reduce((accumulator, current) => {
        return accumulator.concat(current.messages);
      }, []);

      // Flatten the array of message texts and timestamps
      const flattenedMessages = allMessages.map(message => ({
        text: message.message,
        timestamp: message.timestamp,
      }));
      setMessages(flattenedMessages);
    };
    fetchChats();
  }, [adminId]);

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

  const handleChatClick = () => {
    toggleMenu();
    // setCurrentPage('Chat');
    router.push('/admins/Chat/chat')
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
        toast.success('Members appended successfully', {
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
        toast.error('Failed to append members', {
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

    reader.readAsText(file);
  };

  const handleEventChange = (field, value) => {
    setCurrentEvent(prevEvent => {
      let updatedValue;
      if (Array.isArray(value)) {
        updatedValue = value.map(option => option.value);
      } else if (typeof value === 'object' && value.hasOwnProperty('target')) {
        updatedValue = value.target.value;
      } else {
        updatedValue = value;
      }

      return {
        ...prevEvent,
        [field]: updatedValue,
      };
    });
  };

  const handleCloseModal = () => {
    setEventEditModal(false);
  };

  const handleSaveModal = async () => {
    const eventUpdate = { ...currentEvent };
    eventUpdate.questions = eventUpdate.questions.map(({ _id, ...question }) => question);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/updateEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentEvent),
    });
    if (response.ok) {
      toast.success('Event details updated successfully.', {
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
      setEventEditModal(false);
    } else {
      toast.error('Failed to update event details.', {
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

  const handleEditEvent = async (eventId) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getEventDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    });
    const eventData = await response.json();
    setCurrentEvent(eventData.event); // Set the current event
    setQuestions(eventData.event.questions);
    setEventEditModal(true);
  };

  const handleQuestionChange = (id, field, value) => {
    setCurrentEvent(prevEvent => {
      const updatedQuestions = prevEvent.questions.map(question => {
        if (question._id === id) {
          return { ...question, [field]: value };
        }
        return question;
      });
      return {
        ...prevEvent,
        questions: updatedQuestions
      };
    });
  };

  const handleAddQuestion = () => {
    setCurrentEvent(prevEvent => ({
      ...prevEvent,
      questions: [
        ...prevEvent.questions,
        { question: '', type: '' }
      ]
    }));
  };

  const handleRemoveQuestion = (id) => {
    setCurrentEvent(prevEvent => ({
      ...prevEvent,
      questions: prevEvent.questions.filter(question => question._id !== id)
    }));
  };

  const handleDeleteEvent = async (eventId) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/deleteEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    });

    if (response.ok) {
      toast.success('Event deleted successfully.', {
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
      toast.error('Failed to delete event.', {
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

  const handlePost = () => {
    router.push('/admins/post');
  }

  if (!username) {
    return null;
  }

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <div className="App">
            <div className="flex bg-white w-full justify-between items-center">
              <button onClick={toggleMenu} className="p-4">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <img src="/assets/notification.png" width={20} onClick={() => setIsOpen(!isOpen)} className="relative left-[2rem] xs:left-[0.5rem] cursor-pointer" />
              {isOpen && (
                <div ref={nodeNotifications} className="absolute left-[3rem] top-[4rem] py-2 bg-white border rounded shadow-xl overflow-y-auto max-h-64 z-30 w-[30%]">
                  {messages
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort messages in descending order of time
                    .map((message, index) => (
                      <div key={index} onClick={() => { router.push('/admins/Chat/chat') }} className="cursor-pointer transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-purple-500 hover:text-white">
                        <p className="font-semibold">{message.text}</p>
                        <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                </div>
              )}
              <img src="/assets/logo.png" width={200} onClick={handleHomeClick} className='cursor-pointer mx-auto' />
              <button onClick={handleLogout} className="p-2.5 bg-blue-500 rounded-3xl text-white mr-[1rem]">Logout</button>
            </div>
            {isMenuOpen && (
              <div ref={node} className={`absolute top-0 left-0 lg:w-1/6 xs:w-full h-full bg-white flex flex-col p-4 ${isMenuOpen ? 'animate-slide-in' : 'animate-slide-out'}`}>
                <button onClick={toggleMenu} className="mb-4 self-end">
                  <X size={24} />
                </button>
                <ul>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleHomeClick}>Home</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleMemberListClick}>Member List</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleAnalytics}>Analytics</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleManageEventsClick}>Manage Events</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handleChatClick}>Office Chat</li>
                  <li className="p-2 border rounded mb-2 cursor-pointer" onClick={handlePost}>Post Messages</li>
                </ul>
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
                          e.stopPropagation();
                          handleEditEvent(event._id);
                        }} />
                        <DeleteRoundedIcon className="cursor-pointer ml-3" onClick={(e) => {
                          e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                          handleDeleteEvent(event._id);
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
          ) : currentPage === 'Chat' ? (
            <Chat />
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
          {eventEditModal && (
            <Dialog open={eventEditModal} onClose={handleCloseModal}>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogContent>
                {currentEvent && (
                  <>
                    <TextField
                      label="Event Name"
                      fullWidth
                      value={currentEvent.eventName}
                      onChange={(event) => handleEventChange('eventName', event)}
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      label="Event Description"
                      fullWidth
                      value={currentEvent.description}
                      onChange={(event) => handleEventChange('description', event)}
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      label="Event Date"
                      type="date"
                      fullWidth
                      value={currentEvent.date}
                      onChange={(event) => handleEventChange('date', event)}
                      margin="normal"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      label="Event Time"
                      type="time"
                      fullWidth
                      value={currentEvent.time}
                      onChange={(event) => handleEventChange('time', event)}
                      margin="normal"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      label="Location"
                      fullWidth
                      value={currentEvent.location}
                      onChange={(event) => handleEventChange('location', event)}
                      margin="normal"
                      variant="outlined"
                    />
                    <label className="block mb-2">
                      Event Venue:
                      <select
                        value={currentEvent.eventVenue}
                        onChange={(event) => handleEventChange('eventVenue', event.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </label>
                    <label className="block mb-2">
                      Tags:
                      <CreatableSelect
                        isMulti
                        name="tags"
                        options={currentEvent.tags.map(tag => ({ label: tag, value: tag }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOptions) => handleEventChange('tags', selectedOptions)}
                        value={currentEvent.tags ? currentEvent.tags.map(tag => ({ label: tag, value: tag })) : []}
                      />
                    </label>
                    <label className="block mb-2">
                      Collab Forums:
                      <CreatableSelect
                        isMulti
                        name="forums"
                        options={currentEvent.collabForums.map(forum => ({ label: forum, value: forum }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOptions) => handleEventChange('collabForums', selectedOptions)}
                        value={currentEvent.tags ? currentEvent.collabForums.map(collabForums => ({ label: collabForums, value: collabForums })) : []}
                      />
                    </label>
                    {currentEvent && (
                      currentEvent.questions.map((question, index) => (
                        <div key={question._id} className="w-full p-4 border rounded-lg mb-4 mt-6 flex flex-col items-center">
                          <TextField
                            label={`Question ${index + 1}`}
                            fullWidth
                            value={question.question}
                            onChange={event => handleQuestionChange(question._id, 'question', event.target.value)}
                            margin="normal"
                            variant="outlined"
                          />
                          <label className="block mb-2">
                            Response Type:
                            <select
                              name={`type-${index}`}
                              value={question.type}
                              onChange={event => handleQuestionChange(question._id, 'type', event.target.value)}
                              className="mt-1 w-full p-2 border rounded mb-2"
                            >
                              <option value="">Select type</option>
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                            </select>
                          </label>
                          <Chip label="Remove Question" color="error" onClick={() => handleRemoveQuestion(question._id)} />
                        </div>
                      ))
                    )}
                    <Chip label="Add Question" color="success" onClick={handleAddQuestion} />
                    <TextField
                      label="Amount"
                      fullWidth
                      value={currentEvent.amount}
                      onChange={(event) => handleEventChange('amount', event)}
                      margin="normal"
                      variant="outlined"
                    />
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseModal} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleSaveModal} color="primary">
                  Save
                </Button>
              </DialogActions>
            </Dialog>
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