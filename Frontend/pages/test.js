import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import Image from 'next/image';


const Dashboard = ({ username }) => {
  const [forums, setForums] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [tabs, setTabs] = useState('');

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
    <div className="flex bg-white w-full">
      <img src="/assets/logo.png" width={200} />
    </div>
    <div className="w-full flex pb-[40px] justify-center" style={{ backgroundImage: 'url("/assets/bgprofile.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex-col  xs:w-3/4 md:w-1/2  flex items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[70px] mt-[30px]">
          <img src="/assets/profile.svg" width={150} className="self-center"/>
          <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg mt-[30px]">Welcome, {name}</p>
        </div>
    </div>
    <div className="flex flex-row mt-[20px] ml-[30px] xs:justify-center md:justify-start">
      <div className="group transition-all duration-300 ease-in-out px-5">
            <button onClick={()=>{setTabs("Forums")}} className="bg-left-bottom font-product-sans py-3 bg-gradient-to-r from-blue-500 to-blue-500 bg-[length:0%_3px] bg-no-repeat group-hover:bg-[length:100%_3px] transition-all duration-500 ease-out">
             My Forums
            </button>
      </div>

      <div className="group transition-all duration-300 ease-in-out px-5">
         <button onClick={()=>{setTabs("Events")}} className="bg-left-bottom font-product-sans py-3 bg-gradient-to-r from-blue-500 to-blue-500 bg-[length:0%_3px] bg-no-repeat group-hover:bg-[length:100%_3px] transition-all duration-500 ease-out">
            Upcoming Events
          </button>
      </div>

      <div className="group transition-all duration-300 ease-in-out px-5">
         <button onClick={()=>{setTabs("Calendar")}} className="bg-left-bottom font-product-sans py-3 bg-gradient-to-r from-blue-500 to-blue-500 bg-[length:0%_3px] bg-no-repeat group-hover:bg-[length:100%_3px] transition-all duration-500 ease-out">
            My Calendar
          </button>
      </div>
      
    </div>
    <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleModalClose}
          className="fixed inset-0 flex items-center justify-center z-50 outline-none focus:outline-none"
          overlayClassName="fixed inset-0 bg-black/[0.7]"
         
        >
          <div className="relative w-auto max-w-sm mx-auto my-6" onBlur={handleModalClose}>
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
    {
        tabs === "Forums" && <>
        <div className="flex w-scren flex-row md:items-start xs:items-center xs:justify-center md:justify-start gap-4 mt-[30px]">
            {forums.map((forum, index) => (
              <div key={index} className="flex-col border items-center border-gray-800 rounded-2xl bg-white w-[140%] lg:w-[20%] flex justify-center">
                <Image
                  src={`/assets/forums/${forum}.jpg`} // Update the file extension if your images are not .jpg
                  alt={forum}
                  width={60} // Update these values as needed
                  height={60}
                  
                />
                <p className="font-product-sans text-lg">{forum}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={handleModalOpen} className="hire flex items-center p-3 border-gray-800 border-[1px] rounded-[50px]">
              <span className="font-product-sans xs:text-sm sm:text-base">Join a New Community</span>
                <svg className="rtl:rotate-180 xs:w-2.5 sm:w-3.5 xs:h-2.5 sm:h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                </svg>
            </button>
          </div>        
        </>
    }

      {
        tabs === "Events" && <div>Events </div>
      }

      {
         tabs === "Calendar" && <div>Events </div>
      }

      
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

export default Dashboard;
