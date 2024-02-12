import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import Image from 'next/image';


const LoginPage = ({ username }) => {
  const [forums, setForums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const organizations = ['PRODDEC', 'IEEE', 'NSS', 'NCC', 'TINKERHUB'];

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
    router.replace('/login');
  }

  const handleModalOpen = () => {
    setModalIsOpen(true);
  }

  const handleModalClose = () => {
    setModalIsOpen(false);
  }

  const handleOrgSelect = (event) => {
    setSelectedOrg(event.target.value);
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
      <div className="flex h-screen items-center justify-center lg:justify-start" style={{ backgroundImage: 'url("/assets/back.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-full absolute top-2 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-left ml-8">Forum Management</h1>
          <div className="relative">
            <div className='bg-blue-300 rounded-lg'>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-black py-1 px-4 rounded">
                Welcome, {name}
              </button>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg">
                <div className="py-1">
                  <span className="block w-full text-center px-2 py-2 text-sm text-gray-700 ">
                    {email}
                  </span>
                </div>
                <div className="py-1">
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={`absolute ${dropdownOpen ? 'top-40' : 'top-28'} left-14 flex justify-between items-center w-[93%]`}>
          <h2 className="text-2xl font-semibold">Your Organizations</h2>
          <button onClick={handleModalOpen} className="bg-blue-500 text-white px-4 py-2 rounded">+ Add Organization</button>
        </div>
        <div className={`${dropdownOpen ? 'mb-44' : 'mb-48'} mx-5 w-3/5 ml-auto mr-auto`}>
          <div className="flex flex-row items-center justify-center gap-4">
            {forums.map((forum, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-2xl bg-white w-[20%] flex justify-center">
                <Image
                  src={`/assets/forums/${forum}.jpg`} // Update the file extension if your images are not .jpg
                  alt={forum}
                  width={60} // Update these values as needed
                  height={60}
                />
              </div>
            ))}
          </div>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleModalClose}
          className="fixed inset-0 flex items-center justify-center z-50 outline-none focus:outline-none"
          overlayClassName="fixed inset-0 bg-black opacity-90"
        >
          <div className="relative w-auto max-w-sm mx-auto my-6">
            <div className="relative flex flex-col w-full bg-white outline-none focus:outline-none rounded-2xl shadow-lg">
              <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                <h3 className="text-xl font-semibold">Add Organization</h3>
              </div>
              <div className="relative p-6 flex-auto">
                <select value={selectedOrg} onChange={handleOrgSelect}>
                  <option value="">Select</option> {/* Add this line */}
                  {organizations.map((org, index) => (
                    <option key={index} value={org}>{org}</option>
                  ))}
                </select>
                {selectedOrg && (
                  <div className='mt-3'>
                    <input type="text" placeholder="Enter the ID here" style={{ border: '2px solid black' }} value={inputValue} onChange={handleInputChange} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end p-2 border-t border-solid border-gray-300 rounded-b">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white uppercase bg-blue-500 rounded shadow outline-none active:bg-blue-600 hover:shadow-lg focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
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
        destination: '/login',
        permanent: false,
      },
    }
  }

  // If username is available, pass it as a prop
  return {
    props: { username }, // will be passed to the page component as props
  }
}

export default LoginPage;
