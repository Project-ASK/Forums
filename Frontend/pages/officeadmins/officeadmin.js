import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

const OfficeAdmins = ({ username }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog
  const [forums, setForums] = useState([]); // State for forums
  const [selectedForum, setSelectedForum] = useState(''); // State for selected forum
  const [messages, setMessages] = useState([]);
  const officeId = Cookies.get('officeId');

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
      Cookies.set('officeId', data.officeId);
    };
    fetchDetails();
  }, [username]);

  useEffect(() => {
    const fetchForums = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllForums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setForums(data.forums);
      if (data.forums.length > 0) {
        setSelectedForum(data.forums[0]);
      }
    };
    fetchForums();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/chatHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId: officeId }),
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
  }, [officeId]);

  const handleHomeClick = () => {
    router.reload();
  }

  const handleLogout = () => {
    // Clear the cookies and redirect the user to the login page
    Cookies.remove('officeUsername');
    Cookies.remove('token');
    router.replace('/officeadmins/login');
  }

  const handleForumSelect = (event) => {
    setSelectedForum(event.target.value);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  }

  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleChat = () => {
    // Store the selected forum in a cookie
    Cookies.set('selectedForum', selectedForum, { expires: 7 });
    // Navigate to the connect page
    router.push('/officeadmins/connect');
  }

  if (!username) {
    return null;
  }

  return (
    <>
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
              <div ref={nodeNotifications} className="absolute left-[1rem] top-[4rem] bg-white border rounded shadow-xl z-30 w-[20rem] max-h-64 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
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
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-blue-500 rounded-3xl text-white">Logout</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0.5 p-2 h-screen mt-[2rem] w-[80%] mx-auto">
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { router.push('/officeadmins/getForums'); Cookies.set("name", name) }}>
            <img src="/assets/logo.png" width={200} alt="Forums" />
            <p>Forums</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { router.push("/officeadmins/reports") }}>
            <img src="/assets/officeadmins/reporticon.png" width={200} alt="Reports" />
            <p>Reports</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { router.push("/officeadmins/events") }}>
            <img src="/assets/officeadmins/events.png" width={200} alt="Events" />
            <p>Events</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={handleDialogOpen}>
            <img src="/assets/officeadmins/chat.png" width={200} alt="Connect Admins" />
            <p>Connect Admins</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={() => { router.push("/officeadmins/pendingApprovals") }}>
            <img src="/assets/officeadmins/pending-approval.png" width={200} alt="Pending Approvals" />
            <p>Pending Approvals</p>
          </div>
        </div>
      </div>
      {dialogOpen &&
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Select the Forum</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please select forum from the dropdown to connect with.
            </DialogContentText>
            <Select value={selectedForum} onChange={handleForumSelect} className="mt-2">
              {forums.map((forum, index) => (
                <MenuItem key={index} value={forum}>{forum}</MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleChat} color="primary" variant="outlined">
              Chat
            </Button>
          </DialogActions>
        </Dialog>
      }
      <footer className="text-gray-600 body-font">
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
