import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Dialog, DialogTitle, DialogContent, Select, MenuItem, Button } from '@mui/material';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OfficeAdmins = ({ username }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [yearSelectModal, setYearSelectModal] = useState(false);
  const [eventSelectModal, setEventSelectModal] = useState(false);
  const [forums, setForums] = useState([]);
  const [years, setYears] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedForum, setSelectedForum] = useState('Select Forum');
  const [selectedYear, setSelectedYear] = useState('Select Year');
  const [selectedEvent, setSelectedEvent] = useState('Select Event')
  const [isReportSelected, setIsReportSelected] = useState(false);
  const [isEventReportSelected, setIsEventReportSelected] = useState(false);
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

  useEffect(() => {
    // Fetch forums
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllForums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => setForums(data.forums));
  }, []);

  useEffect(() => {
    if (selectedForum) {
      // Fetch years
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getReportYears`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forum: selectedForum }),
      })
        .then(response => response.json())
        .then(data => setYears(data.years));
    }
  }, [selectedForum]);

  useEffect(() => {
    const fetchAllEvents = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllEventsByForum?forum=${selectedForum}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const currentEvents = data.events.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(currentEvents);
    }
    fetchAllEvents();
  }, [selectedForum]);

  const handleForumChange = (event) => {
    setSelectedForum(event.target.value);
    setIsReportSelected(event.target.value !== 'Select Forum' && selectedYear !== 'Select Year');
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setIsReportSelected(selectedForum !== 'Select Forum' && event.target.value !== 'Select Year');
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
    const selectedEvent = events.find(e => e.eventName === event.target.value);
    if (!selectedEvent.reportPath) {
      // If it doesn't exist, show a toast
      toast.error('No report found for this event.', {
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
      setIsEventReportSelected(selectedForum !== 'Select Forum' && event.target.value !== 'Select Event');
    }
  }

  const handleHomeClick = () => {
    router.reload();
  }

  const handleLogout = () => {
    // Clear the cookies and redirect the user to the login page
    Cookies.remove('officeUsername');
    Cookies.remove('token');
    router.replace('/officeadmins/login');
  }

  const handleYearSelectModal = () => {
    setYearSelectModal(true);
  }

  const handleYearSelectModalClose = () => {
    setYearSelectModal(false);
  }

  const handleEventSelectModal = () => {
    setEventSelectModal(true);
  }

  const handleEventSelectModalClose = () => {
    setEventSelectModal(false);
  }

  if (!username) {
    return null;
  }

  return (
    <>
      <ToastContainer />
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

        <div className="flex items-center justify-center mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-2 grid-rows-1 gap-5 p-1 max-w-screen-md">
            <div className="flex flex-col items-center justify-center p-10 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={handleYearSelectModal}>
              <img src="/assets/officeadmins/annualreport.jpeg" width={200} height={200} alt="annualreport" />
              <p>Annual Report</p>
            </div>
            <div className="flex flex-col items-center justify-center p-10 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={handleEventSelectModal}>
              <img src="/assets/officeadmins/eventreport.jpeg" width={200} height={200} alt="eventReports" />
              <p>Events Report</p>
            </div>
          </div>
        </div>
        {yearSelectModal && (
          <Dialog open={yearSelectModal} onClose={handleYearSelectModalClose}>
            <DialogTitle>Select year for report</DialogTitle>
            <DialogContent>
              <Select className="w-full mb-4" value={selectedForum} onChange={handleForumChange}>
                <MenuItem value="Select Forum">Select Forum</MenuItem>
                {forums.map((forum, index) => (
                  <MenuItem key={index} value={forum}>{forum}</MenuItem>
                ))}
              </Select>
              <Select className="w-full" value={selectedYear} onChange={handleYearChange}>
                <MenuItem value="Select Year">Select Year</MenuItem>
                {years && years.map((year, index) => (
                  <MenuItem key={index} value={year}>{year}</MenuItem>
                ))}
              </Select>
              {isReportSelected && (
                <Button color="info" variant="outlined" style={{ display: 'block', margin: '20px' }} onClick={() => {
                  window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getReport?forum=${selectedForum}&year=${selectedYear}`, '_blank');
                  handleYearSelectModalClose();
                }}>
                  Download Report
                </Button>
              )}
            </DialogContent>
          </Dialog>
        )}
        {eventSelectModal && (
          <Dialog open={eventSelectModal} onClose={handleEventSelectModalClose}>
            <DialogTitle>Select an Event to submit report</DialogTitle>
            <DialogContent>
              <Select className="w-full mb-4" value={selectedForum} onChange={handleForumChange}>
                <MenuItem value="Select Forum">Select Forum</MenuItem>
                {forums.map((forum, index) => (
                  <MenuItem key={index} value={forum}>{forum}</MenuItem>
                ))}
              </Select>
              <Select className="w-full mb-4" value={selectedEvent} onChange={handleEventChange}>
                <MenuItem value="Select Event">Select Event</MenuItem>
                {events.map((event, index) => (
                  <MenuItem key={index} value={event.eventName}>{event.eventName}</MenuItem>
                ))}
              </Select>
              {isEventReportSelected && (
                <Button color="info" variant="outlined" style={{ display: 'block', margin: 'auto' }} onClick={() => {
                  window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getEventReport?forum=${selectedForum}&eventName=${selectedEvent}`, '_blank');
                  handleEventSelectModalClose();
                }}>
                  Download Report
                </Button>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
      <footer className="text-gray-600 body-font absolute bottom-0 w-full">
        <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
          <div className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
            <img src="/assets/authlogo.png" width={90} />
            <span className="ml-3 text-xl">Forums CEC</span>
          </div>
          <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">© 2024 Forums CEC</p>
        </div>
      </footer>
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
