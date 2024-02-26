import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import Image from 'next/image';


const Dashboard = ({ username }) => {
  const [forums, setForums] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('');
  const [tabs, setTabs] = useState('');
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [no_of_days, setNo_of_days] = useState([]);
  const [blankdays, setBlankdays] = useState([]);
  const [calevents, setCalEvents] = useState([
    // Add your events here
  ]);
  const [event_title, setEvent_title] = useState('');
  const [event_date, setEvent_date] = useState('');
  const [event_theme, setEvent_theme] = useState('blue');
  const [openEventModal, setOpenEventModal] = useState(false);

  useEffect(() => {
    getNoOfDays();
  }, [month, year]);

  function getNoOfDays() {
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    // find where to start calendar day of week
    let dayOfWeek = new Date(year, month).getDay();
    let blankdaysArray = [];
    for (var i = 1; i <= dayOfWeek; i++) {
      blankdaysArray.push(i);
    }

    let daysArray = [];
    for (var i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    setBlankdays(blankdaysArray);
    setNo_of_days(daysArray);
  }

  function isToday(date) {
    const today = new Date();
    const d = new Date(year, month, date);

    return today.toDateString() === d.toDateString() ? true : false;
  }

  function showEventModal(date) {
    setOpenEventModal(true);
    setEvent_date(new Date(year, month, date).toDateString());
  }

  function addEvent() {
    if (event_title == '') {
      return;
    }

    // Add this
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addCustomEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username, event: {
          event_date: event_date,
          event_title: event_title,
          event_theme: event_theme
        }
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Event added successfully');
          setCalEvents([...calevents, {
            event_date: event_date,
            event_title: event_title,
            event_theme: event_theme
          }]);
        } else {
          alert('Failed to add event');
        }
      });

    // clear the form data
    setEvent_title('');
    setEvent_date('');
    setEvent_theme('blue');

    //close the modal
    setOpenEventModal(false);
  }

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

      // Call fetchEvents here after forums data is set
      fetchEvents(data.forums);
      setCalEvents(data.customEvents);
    };

    const fetchEvents = async (forums) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getEvents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forums: forums.map(forum => forum.name) }),
      });

      const data = await response.json();
      const currentEvents = data.events.filter(event => new Date(event.date) >= new Date());
      setEvents(currentEvents);
    }

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

  const handleOrgSelect = (event) => {
    setSelectedOrg(event.target.value);
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleSubmit = () => {
    handleModalClose();
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

  function deleteEvent(event) {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteCustomEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username, event
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Event deleted successfully');
          setCalEvents(calevents.filter(e => !(e.event_date === event.event_date && e.event_title === event.event_title)));
        } else {
          alert('Failed to delete event');
        }
      });
  }



  // If username is not available, don't render anything
  if (!username) {
    return null;
  }

  return (
    <>
      <div className="flex bg-white w-full justify-between items-center">
        <img src="/assets/logo.png" width={200} />
        <button onClick={handleLogout} className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem] w-[5%]">Logout</button>
      </div>
      <div className="w-full flex pb-[40px] justify-center" style={{ backgroundImage: 'url("/assets/bgprofile.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex-col  xs:w-3/4 md:w-1/2  flex items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[70px] mt-[30px]">
          <img src="/assets/profile.svg" width={150} className="self-center" />
          <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg mt-[30px]">Welcome, {name}</p>
        </div>
      </div>
      <div className="flex flex-row mt-[20px] ml-[30px] xs:justify-center md:justify-start">
        <div className="group transition-all duration-300 ease-in-out px-5">
          <button onClick={() => { setTabs("Forums"); }} className="bg-left-bottom font-product-sans py-3 bg-gradient-to-r from-blue-500 to-blue-500 bg-[length:0%_3px] bg-no-repeat group-hover:bg-[length:100%_3px] transition-all duration-500 ease-out">
            My Forums
          </button>
        </div>

        <div className="group transition-all duration-300 ease-in-out px-5">
          <button onClick={() => { setTabs("Events") }} className="bg-left-bottom font-product-sans py-3 bg-gradient-to-r from-blue-500 to-blue-500 bg-[length:0%_3px] bg-no-repeat group-hover:bg-[length:100%_3px] transition-all duration-500 ease-out">
            Upcoming Events
          </button>
        </div>

        <div className="group transition-all duration-300 ease-in-out px-5">
          <button onClick={() => { setTabs("Calendar") }} className="bg-left-bottom font-product-sans py-3 bg-gradient-to-r from-blue-500 to-blue-500 bg-[length:0%_3px] bg-no-repeat group-hover:bg-[length:100%_3px] transition-all duration-500 ease-out">
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
      {
        tabs === "Forums" && <>
          <div className="flex w-scren md:ml-[50px] flex-row md:items-start xs:items-center xs:justify-center md:justify-start gap-4 mt-[30px]">
            {forums.map((forum, index) => (
              <div key={index} className="flex-col border items-center border-gray-800 rounded-2xl bg-white w-[140%] lg:w-[20%] flex justify-center">
                <Image
                  src={`/assets/forums/${forum.name}.jpg`} // Update the file extension if your images are not .jpg
                  alt={forum.name}
                  width={60} // Update these values as needed
                  height={60}
                  className="mt-[20px]" />
                <p className="font-product-sans font-bold p-3">{forum.name}</p>
                <p className="font-product-sans-m text-sm p-3 text-justify">{forum.description}</p>
                <button className="font-product-sans font-bold p-3 text-blue-500 text-[11px] self-end" onClick={() => { router.push({ pathname: '/user/userForum', query: { data: forum.name } }, '/user/userForum') }}>View Dashboard</button>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-[30px]">
            <button type="button" onClick={handleModalOpen} className="hire flex items-center p-3 border-gray-800 border-[1px] rounded-[50px]">
              <span className="font-product-sans xs:text-sm sm:text-base">Join a New Community</span>
              <svg className="rtl:rotate-180 xs:w-2.5 sm:w-3.5 xs:h-2.5 sm:h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
              </svg>
            </button>
          </div>
        </>
      }

      {
        tabs === "Events" && <>
          <div className="flex w-scren md:ml-[50px] flex-row md:items-start xs:items-center xs:justify-center md:justify-start gap-4 mt-[30px] pb-4">
            {events && events.map((event, index) => (
              <div key={index} className="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-72 mt-[20px]">
                <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-72">
                  <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.imagePath}`} alt="card-image" className="object-cover w-full h-full" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="block font-product-sans font-bold antialiased leading-relaxed text-blue-gray-900">
                      {event.eventName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-5 mb-2">
                    <div className="flex p-2 text-sm text-white font-product-sans items-center justify-center space-x-2 bg-red-300 rounded-xl">
                      <img src="/assets/queue.png" height={10} width={20} />
                      <p>{event.forumName}</p>
                    </div>
                    <div className="flex p-2 text-sm text-white font-product-sans items-center justify-center space-x-2 bg-amber-200 rounded-xl">
                      <img src="/assets/time.png" height={10} width={20} />
                      <p className="text-zinc-600">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex p-2 text-[11px] text-white font-product-sans justify-between items-center bg-emerald-300 rounded-xl">
                    <img src="/assets/pin.png" height={10} width={20} />
                    <p>{event.location}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100"
                    type="button">
                    Join Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      }
      {
        tabs === "Calendar" && <div>
          <div className="antialiased sans-serif bg-gray-100 h-full">
            <div className="container mx-auto px-4 py-2 md:py-12">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex items-center justify-between py-2 px-6">
                  <div>
                    <span className="text-lg font-bold text-gray-800">{MONTH_NAMES[month]}</span>
                    <span className="ml-1 text-lg text-gray-600 font-normal">{year}</span>
                  </div>
                  <div className="flex border rounded-lg space-x-5 justify-center p-1">
                    <button
                      type="button"
                      className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-2 items-center"
                      disabled={month == 0}
                      onClick={() => { setMonth(month - 1); getNoOfDays(); }}
                    >
                      Previous
                    </button>
                    <div className="border-r inline-flex h-"></div>
                    <button
                      type="button"
                      className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex items-center cursor-pointer hover:bg-gray-200 p-2"
                      disabled={month == 11}
                      onClick={() => { setMonth(month + 1); getNoOfDays(); }}
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="-mx-1 -mb-1">
                  <div className="flex flex-wrap" style={{ marginBottom: '-40px' }}>
                    {DAYS.map((day, index) =>
                      <div style={{ width: '14.26%' }} className="px-2 py-2" key={index}>
                        <div className="text-gray-600 text-sm uppercase tracking-wide font-bold text-center">{day}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap border-t border-l">
                    {blankdays.map((i) =>
                      <div style={{ width: '14.28%', height: '120px' }} className="text-center border-r border-b px-4 pt-2" key={i}></div>
                    )}
                    {no_of_days.map((date, i) =>
                      <div style={{ width: '14.28%', height: '120px' }} className="px-4 pt-2 border-r border-b relative" key={i}>
                        <div
                          onClick={() => showEventModal(date)}
                          className={`inline-flex w-6 h-6 items-center justify-center cursor-pointer text-center leading-none rounded-full transition ease-in-out duration-100 ${isToday(date) ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-200'}`}
                        >
                          {date}
                        </div>
                        <div style={{ height: '80px' }} className="overflow-y-auto mt-1">
                          {calevents && calevents.filter(e => new Date(e.event_date).toDateString() === new Date(year, month, date).toDateString()).map((event, i) =>
                            <div
                              className={`px-2 py-1 rounded-lg mt-1 cursor-pointer overflow-hidden border ${event.event_theme === 'blue' ? 'border-blue-200 text-blue-800 bg-blue-100' : event.event_theme === 'red' ? 'border-red-200 text-red-800 bg-red-100' : event.event_theme === 'yellow' ? 'border-yellow-200 text-yellow-800 bg-yellow-100' : event.event_theme === 'green' ? 'border-green-200 text-green-800 bg-green-100' : 'border-purple-200 text-purple-800 bg-purple-100'}`}
                              key={i} onClick={() => deleteEvent(event)}
                            >
                              <p className="text-sm truncate leading-tight">{event.event_title}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {openEventModal &&
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full">
                <div className="p-4 max-w-xl mx-auto relative left-0 right-0 overflow-hidden mt-24">
                  <div className="shadow  rounded-lg bg-white overflow-hidden w-full block p-8">
                    <h2 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-2">Add Event Details</h2>
                    <div className="mb-4">
                      <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Event title</label>
                      <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={event_title} onChange={(e) => setEvent_title(e.target.value)} />
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Event date</label>
                      <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="text" value={event_date} readOnly />
                    </div>
                    <div className="inline-block w-64 mb-4">
                      <label className="text-gray-800 block mb-1 font-bold text-sm tracking-wide">Select a theme</label>
                      <div className="relative">
                        <select value={event_theme} onChange={(e) => setEvent_theme(e.target.value)} className="block appearance-none w-full bg-gray-200 border-2 border-gray-200 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-gray-700">
                          <option value="blue">Blue Theme</option>
                          <option value="red">Red Theme</option>
                          <option value="yellow">Yellow Theme</option>
                          <option value="green">Green Theme</option>
                          <option value="purple">Purple Theme</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-8 text-right">
                      <button type="button" className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm mr-2" onClick={() => setOpenEventModal(false)}>
                        Cancel
                      </button>
                      <button type="button" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 border border-gray-700 rounded-lg shadow-sm" onClick={addEvent}>
                        Save Event   </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

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