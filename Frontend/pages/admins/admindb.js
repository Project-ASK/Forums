import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import Image from 'next/image';
import {Menu, X} from 'react-feather';


  const Dashboard = ({ username }) => {
  const [forums, setForums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [tabs, setTabs] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }
  useEffect(() => {
    const fetchForums = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getForums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setForums(data.forums);
      setName(data.name);
      setEmail(data.email);
    };

    fetchForums();
  }, [username]);

  const handleLogout = () => {
    // Clear the cookies and redirect the user to the login page
    Cookies.remove('username');
    Cookies.remove('token');
    router.replace('/auth/login');
  }

  const handleModalOpen = () => {
    setModalIsOpen(true);
  }

  const handleModalClose = () => {
    setModalIsOpen(false);
  }


  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleSubmit = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addForum`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, org: selectedOrg, id: inputValue }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Success');
          handleModalClose();
        } else {
          alert('Failed');
        }
      });
  }


  // If username is not available, don't render anything
  if (!username) {
    return null;
  }

  return (
    <>
    <div className="App">
      <div className="flex bg-white w-full">
        <button onClick={toggleMenu} className="p-4">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <img src="/assets/logo.png" width={200} />
      </div>
      {isMenuOpen && (
        <div className="absolute top-0 left-0 w-1/6 h-full bg-white flex flex-col p-4 transition-transform duration-200 transform translate-x-0">
          <button onClick={toggleMenu} className="mb-4 self-end">
            <X size={24} />
          </button>
          <ul>
          <li className="p-2 border rounded mb-2"><a href="#analytics">Analytics</a></li>
            <li className="p-2 border rounded mb-2"><a href="#member-list">Member List</a></li>
            <li className="p-2 border rounded mb-2"><a href="#events">Events</a></li>
          </ul>
        </div>
      )}
    </div>
      
    <div className="flex bg-white w-full">
    </div>
    <div className="w-full flex pb-[40px] justify-center" style={{ backgroundImage: 'url("/assets/bgprofile.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex-col  xs:w-3/4 md:w-1/2  flex items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[70px] mt-[30px]">
          <img src="/assets/profile.svg" width={150} className="self-center"/>
          <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg mt-[30px]">Welcome, {name}</p>
        </div>
    </div>
    <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleModalClose}
          className="fixed inset-0 flex items-center justify-center z-50 outline-none focus:outline-none"
          overlayClassName="fixed inset-0 bg-black/[0.7]"
         
        >
        </Modal>     
    </> 
  );
};

export async function getServerSideProps(context) {
  // Get username from cookies
  const username = context.req.cookies.username;

  // If username is not available, redirect to login
  if (!username) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }

  // If username is available, pass it as a prop
  return {
    props: { username }, // will be passed to the page component as props
  }
}

export default Dashboard;
