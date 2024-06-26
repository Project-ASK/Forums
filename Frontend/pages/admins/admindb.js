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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Menu, X } from 'react-feather';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import path from 'path'
import Chat from './Chat/chat'
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Button, TextField, Paper, Typography } from '@mui/material';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@mui/material/Modal';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';

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
  const [currentImage, setCurrentImage] = useState('');
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [calendarModal, setCalendarModal] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const node = useRef();


  const nodeNotifications = useRef(); // Create a new useRef for notifications
  const nodeCalendarNotifications = useRef();

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

  const handleClickOutsideCalendarNotifications = e => { // Define handleClickOutsideNotifications function
    if (nodeCalendarNotifications.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click 
    setCalendarModal(false);
  };

  useEffect(() => { // Add useEffect for notifications
    if (calendarModal) {
      document.addEventListener("mousedown", handleClickOutsideCalendarNotifications);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideCalendarNotifications);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCalendarNotifications);
    };
  }, [calendarModal]);

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
    const fetchAllEvents = async () => {
      const responseEvents = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllEvents`);
      const dataEvents = await responseEvents.json();
      setEventList(dataEvents.events);
      setIsLoading(false);
    };
    fetchAllEvents();
  }, [isLoading]);

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

  const handleDeleteEvent = async (eventId, callback) => {
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
      callback();
      setDeleteModal(false);
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

  const handleReportUpload = () => {
    router.push('/admins/uploadReports');
  }

  const handleDeleteModalClose = () => {
    setDeleteModal(false);
  }

  if (!username) {
    return null;
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

  const handleOpen = (imagePath) => {
    setCurrentImage(imagePath);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Function to convert JSON to CSV
  const convertToCSV = (objArray) => {
    let str = '';

    // Header
    str += 'Name,Email,Phone Number,Year of Join\r\n';

    // Data
    objArray.forEach((member) => {
      str += `${member.name},${member.email},${member.phoneNumber},${member.yearOfJoin}\r\n`;
    });

    return str;
  }

  // Function to download CSV file
  const downloadCSV = (args) => {
    let data, filename, link;
    let csv = convertToCSV(args.data);
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  const handleCalendarOpen = () => {
    setCalendarModal(true);
  }

  function ServerDay(props) {
    const { eventList, day, outsideCurrentMonth, ...other } = props;
    const [openModal, setOpenModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Check if the current date matches any event date
    const event = eventList.find(event => event.date === day.format('YYYY-MM-DD'));

    // Render a label if an event exists for the current date
    const label = event ? event.eventName : null;

    const handleClick = () => {
      if (label) {
        setOpenModal(true);
        setSelectedEvent(event);
      }
    };

    const handleCloseModal = () => {
      setOpenModal(false);
    };

    const formattedDate = dayjs(day.format('YYYY-MM-DD')).format('MMMM DD, YYYY');

    return (
      <>
        <Badge
          key={day.toString()}
          overlap="circular"
          badgeContent={label ? '✅' : undefined}
        >
          <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} onClick={handleClick} />
        </Badge>
        {selectedEvent && (
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="event-modal-title"
            aria-describedby="event-modal-description"
          >
            <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '2rem' }} className="rounded-2xl">
              <Typography variant="h6" id="event-modal-title" gutterBottom sx={{ marginBottom: 2 }} className="text-center font-bold underline">
                Event Details
              </Typography>
              <Typography variant="body1" id="event-modal-title" gutterBottom>
                <span className="font-semibold">Event Name:</span> {selectedEvent.eventName}
              </Typography>
              <Typography variant="body1" id="event-modal-description" gutterBottom>
                <span className="font-semibold">Event Forum:</span> {selectedEvent.forumName}
              </Typography>
              <Typography variant="body1" id="event-modal-title">
                <span className="font-semibold">Event Date:</span> {formattedDate}
              </Typography>
            </Paper>
          </Modal>
        )}
      </>
    );
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied successfully.', {
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
    } catch (err) {
      toast.error('Failed to copy.', {
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

  return (
    <>
      <ToastContainer />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px' }}>
          <h2 id="simple-modal-title">Approval Letter</h2>
          <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, currentImage)} alt="Approval Letter" width={500} height={500} layout="responsive" />
        </div>
      </Modal>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <div className="App">
            <div className="flex bg-white w-full justify-between items-center">
              <button onClick={toggleMenu} className="p-4">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <img src="/assets/notification.png" width={20} onClick={() => setIsOpen(!isOpen)} className="relative lg:left-[0.3rem] cursor-pointer" />
              {isOpen && (
                <div ref={nodeNotifications} className="absolute left-[3rem] top-[4.5rem] bg-white border rounded shadow-xl z-30 w-[20rem] max-h-64 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <style jsx>{`
                  .absolute::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white">Notifications</h2>
                    <div className="overflow-y-auto max-h-[calc(100% - 3rem)]">
                      {messages
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort messages in descending order of time
                        .map((message, index) => (
                          <div key={index} className="cursor-pointer transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-blue-300 hover:text-white mb-2">
                            <p className="font-semibold">{message.text}</p>
                            <p className="font-semibold">{message.forumName}</p>
                            <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              <img src="/assets/calendar.png" width={20} onClick={handleCalendarOpen} className="relative lg:left-[1.4rem] xs:left-[1rem] cursor-pointer" />
              {calendarModal && (
                <div ref={nodeCalendarNotifications} className="absolute left-[3rem] top-[4.5rem] bg-white border rounded shadow-xl z-30 w-[20rem] overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <style jsx>{`
                  .absolute::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                  <h2 className="text-xl font-bold mt-3 sticky text-center top-0 bg-white">Calendar</h2>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                      loading={isLoading}
                      renderLoading={() => <DayCalendarSkeleton />}
                      slots={{
                        day: (props) => <ServerDay {...props} eventList={eventList} />,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              )}
              <img src="/assets/logo.png" width={200} onClick={handleHomeClick} className='cursor-pointer mx-auto' />
              <button onClick={handleLogout} className="Btn mr-[30px]">
                <div className="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
                <div className="text">Logout</div>
              </button>
            </div>
            {isMenuOpen && (
              <div ref={node} className={`absolute top-0 left-0 lg:w-1/6 xs:w-full h-full bg-white flex flex-col p-4 ${isMenuOpen ? 'animate-slide-in' : 'animate-slide-out'}`}>
                <button onClick={toggleMenu} className="mb-4 self-end">
                  <X size={24} />
                </button>
                <ul>
                  <li className="mb-2 cursor-pointer flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={handleHomeClick}>
                    <img src="/assets/home.svg" className="ml-[30px]" width={20} />
                    <p className="font-sans text-md">Home</p>
                  </li>
                  <li className="mb-2 cursor-pointer flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={handleMemberListClick}>
                    <img src="/assets/people.svg" className="ml-[30px]" width={20} />
                    <p className="font-sans text-md">Members</p>
                  </li>
                  <li className="mb-2 cursor-pointer flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={handleAnalytics}>
                    <img src="/assets/stats.svg" className="ml-[30px]" width={20} />
                    <p className="font-sans text-md">Analytics</p>
                  </li>
                  <li className="mb-2 cursor-pointer flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={handleManageEventsClick}>
                    <img src="/assets/events.svg" className="ml-[30px]" width={20} />
                    <p className="font-sans text-md">Events</p>
                  </li>
                  <li className="mb-2 cursor-pointer flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={handleChatClick}>
                    <img src="/assets/chat.svg" className="ml-[30px]" width={20} />
                    <p className="font-sans text-md">Office Chat</p>
                  </li>
                  <li className="mb-2 cursor-pointer flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={handlePost}>
                    <img src="/assets/message.svg" className="ml-[30px]" width={20} />
                    <p className="font-sans text-md">Post Messages</p>
                  </li>
                  <li className="mb-2 cursor-pointer flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={handleReportUpload}>
                    <img src="/assets/uploadReport.svg" className="ml-[30px]" width={20} />
                    <p className="font-sans text-md">Upload Reports</p>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {currentPage === 'memberList' ? (
            <div>
              <h2 className="text-2xl font-product-sans font-medium mb-5 text-center mt-[4rem]">Members of {forum}:</h2>
              <div className="mx-auto flex justify-center">
                <input type="file" id="fileUpload" onChange={handleFileUpload} style={{ display: 'none' }} />
                <label htmlFor="fileUpload" className="cursor-pointer cssbuttons-io-button flex space-x-5 mr-3">
                  <img src="/assets/upload.svg" width={20} />
                  <p className="font-product-sans text-sm font-normal">Import</p>
                </label>
                <button
                  onClick={() => downloadCSV({ filename: "member-data.csv", data: filteredMembers })}
                  className="cssbuttons-io-button flex space-x-5 bg-blue-500 hover:bg-blue-600 transition-colors duration-300 ease-in-out text-white px-4 py-2 rounded-md shadow-md">
                  Generate CSV
                </button>
                {/* <button onClick={() => setShowModal(true)}>Add Member</button> */}
              </div>
              <div className="relative overflow-x-auto shadow-md mx-auto sm:rounded-lg lg:w-[60%] xs:w-full mt-[2rem]">
                <div className="pb-3 bg-white">
                  <div className="relative mt-1 ml-[30px]">
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
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 mt-[10px]">
                  <thead className="text-xs text-gray-900 border-b uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Phone Number
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Year of Join
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-300"
                      >
                        <td className="px-6 py-4 flex font-medium text-gray-900 whitespace-nowrap">
                          {member.name}
                          {member.name &&
                            <span className="ml-[0.7rem] mt-[0.2rem]" onClick={() => handleCopy(member.name)}>
                              <svg class="w-3.5 h-3.5 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 18 20">
                                <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                              </svg>
                            </span>
                          }
                          {!member.name &&
                            <p>None</p>
                          }
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex">
                            {member.email}
                            {member.email &&
                              <span className="ml-[0.7rem] mt-[0.2rem]" onClick={() => handleCopy(member.email)}>
                                <svg class="w-3.5 h-3.5 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 18 20">
                                  <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                                </svg>
                              </span>
                            }
                            {!member.email &&
                              <p>None</p>
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex">
                            {member.phoneNumber}
                            {member.phoneNumber &&
                              <span className="ml-[0.7rem] mt-[0.2rem]" onClick={() => handleCopy(member.phoneNumber)}>
                                <svg class="w-3.5 h-3.5 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 18 20">
                                  <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                                </svg>
                              </span>
                            }
                            {!member.phoneNumber &&
                              <p>None</p>
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex">
                            {member.yearOfJoin}
                            {member.yearOfJoin &&
                              <span className="ml-[0.7rem] mt-[0.2rem]" onClick={() => handleCopy(member.yearOfJoin)}>
                                <svg class="w-3.5 h-3.5 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 18 20">
                                  <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                                </svg>
                              </span>
                            }
                            {!member.yearOfJoin &&
                              <p>None</p>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          ) : currentPage === 'manageEvents' ? (
            <Grid item xs={12}>
              <div className="lg:w-full flex flex-col items-center mt-10 xs:w-[70%] mx-auto">
                <button className="p-2.5 bg-blue-500 rounded-full text-white mb-4" onClick={() => { router.push('createEvent') }}>Create Event</button>
                {events && events.length > 0 ? (
                  events.map((event, index) => (
                    <div key={index} className="w-full md:w-3/4 lg:w-2/3 p-4 border rounded-lg mb-4 bg-gray-300 flex flex-col md:flex-row items-center" >
                      <div className="md:w-1/6 pr-2">
                        <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, event.eventImagePath)} alt={event.eventName} width={100} height={100} layout="responsive" className="cursor-pointer" onClick={() => {
                          Cookies.set('eventId', event._id, { expires: 7 }); // Set the event id as a cookie
                          router.push(`/admins/eventdetails`); // Navigate to the eventdetails page
                        }} />
                      </div>
                      <div className="xs:mt-2 lg:mt-0 md:w-3/4 md:ml-[1rem]">
                        <h2 className="text-lg font-bold">{event.eventName}</h2>
                        <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{event.date}</p>
                        <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{event.time}</p>
                        <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{event.location}</p>
                        {event.collabForums.filter(forumName => forumName !== forum).length > 0 && (
                          <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{event.collabForums.filter(forumName => forumName !== forum).join(', ')}</p>
                        )}
                      </div>
                      <div className="w-full md:w-1/4 flex flex-wrap justify-end items-center mt-4 md:mt-0 gap-4">
                        <div className="w-full flex lg:flex-nowrap xs:flex-wrap justify-end mt-2 gap-x-2 gap-y-2">
                          <Chip
                            icon={<VisibilityIcon />}
                            label="Staff Letter"
                            clickable
                            color="success"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                              if (event.approvalImagePath) {
                                handleOpen(event.approvalImagePath);
                              }
                            }}
                            style={{ width: '50%' }}
                          />
                          <Chip
                            icon={<VisibilityIcon />}
                            label="Office"
                            clickable
                            color="info"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                              if (event.principalApprovalImagePath) {
                                handleOpen(event.principalApprovalImagePath);
                              } else {
                                toast.error('Letter not found', {
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
                            }}
                            style={{ width: '50%' }}
                          />
                          <Chip
                            icon={
                              event.isApproved === 'Approved' ? <CheckCircleIcon /> :
                                event.isApproved === 'Pending' ? <HourglassBottomIcon /> :
                                  <CancelIcon />
                            }
                            label={event.isApproved}
                            color={event.isApproved === 'Approved' ? 'success' : event.isApproved === 'Pending' ? 'warning' : 'error'}
                          />
                        </div>
                        <div className="w-full flex justify-end gap-x-2">
                          <EditOutlinedIcon className="cursor-pointer ml-2" onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event._id);
                          }} />
                          <DeleteRoundedIcon className="cursor-pointer ml-3" onClick={(e) => {
                            e.stopPropagation(); // Prevent the click event from bubbling up to the parent
                            setDeleteModal(true);
                          }} />
                          {deleteModal && (
                            <Dialog
                              open={deleteModal}
                              onClose={handleDeleteModalClose}
                              aria-describedby="alert-dialog-slide-description"
                            >
                              <DialogTitle>{"Do you really want to delete the event?"}</DialogTitle>
                              <DialogContent>
                                <DialogContentText id="alert-dialog-slide-description">
                                  Deleting this event will completely remove this event.
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleDeleteModalClose} className="hover:bg-red-200">No</Button>
                                <Button onClick={() => handleDeleteEvent(event._id, handleClose)} className="hover:bg-green-200">Yes</Button>
                              </DialogActions>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-[60%] p-4 border rounded mb-4 bg-gray-300">
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
                      required
                      value={currentEvent.eventName}
                      onChange={(event) => handleEventChange('eventName', event)}
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      label="Event Description"
                      fullWidth
                      required
                      value={currentEvent.description}
                      onChange={(event) => handleEventChange('description', event)}
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      label="Event Date"
                      type="date"
                      fullWidth
                      required
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
                      required
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
                      required
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
                      required
                      value={currentEvent.amount}
                      onChange={(event) => handleEventChange('amount', event)}
                      margin="normal"
                      variant="outlined"
                    />
                    <TextField
                      label="Certificate Link"
                      fullWidth
                      value={currentEvent.certificateLink}
                      onChange={(event) => handleEventChange('certificateLink', event)}
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