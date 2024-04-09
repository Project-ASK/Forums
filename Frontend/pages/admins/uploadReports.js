import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image';
import path from 'path'
import { ToastContainer, Bounce, toast } from 'react-toastify';
import { Box, Dialog, DialogTitle, DialogContent, Typography, Select, MenuItem } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@mui/material/Modal';

const Dashboard = ({ username }) => {
    const router = useRouter();
    const [ownEvents, setOwnEvents] = useState([]);
    const [annualReportModal,setAnnualReportModal] = useState(false);
    const [eventSelectModal,setEventSelectModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState('Select Event');
    const [eventReportModal,setEventReportModal] = useState(false);
    const forum = Cookies.get('forum');

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

    const handleAnnualReportModal = () => {
        setAnnualReportModal(true);
    }

    const handleEventSelectModal = () => {
        setEventSelectModal(true);
    }

    const handleAnnualModalClose = () => {
        setAnnualReportModal(false);
    }

    const handleEventReportModal = () => {
        setEventReportModal(true);
    }

    const handleEventReportModalClose = () => {
        setEventReportModal(false);
    }

    const handleEventSelectModalClose = () => {
        setEventSelectModal(false);
    }

    const handleEventSelection = (event) => {
        const selectedValue = event.target.value;
        setSelectedEvent(selectedValue);
        if (selectedValue !== "Select") {
            handleEventSelectModalClose();
            handleEventReportModal();
        }
    }

    const handleAnnualReportUpload = async (event) => {
        const file = event.target.files[0];
        if (file.type !== 'application/pdf') {
            toast.error('Invalid file type. Please upload a PDF file.');
            return;
        }
        const formData = new FormData();
        formData.append('annualReport', file);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updloadAnnualReport?forumName=${forum}`, {
            method: 'POST',
            body: formData,
        });
        if(response.ok)
        {
            toast.success('Report uploaded successfully.', {
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
        setAnnualReportModal(false);
    }

    const handleEventReportUpload = async (event) => {
        const file = event.target.files[0];
        if (file.type !== 'application/pdf') {
            toast.error('Invalid file type. Please upload a PDF file.');
            return;
        }
        const formData = new FormData();
        formData.append('eventReport', file);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updloadEventReport?forumName=${forum}&eventName=${selectedEvent}`, {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            toast.success('Event Report uploaded successfully.', {
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
        setEventReportModal(false);
    }

    const handleback = () => {
        router.back();
    }

    return (
        <>
            <ToastContainer />
            <div className="App">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={200} onClick={handleback} className='cursor-pointer' />
                </div>
            </div>
            <div className="flex items-center justify-center mt-20">
                <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-2 grid-rows-1 gap-5 p-1 max-w-screen-md">
                    <div className="flex flex-col items-center justify-center p-10 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={handleAnnualReportModal}>
                        <img src="/assets/officeadmins/annualreport.jpeg" width={200} height={200} alt="annualreport" />
                        <p>Annual Report</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-10 border rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 bg-gray-50 mb-4 sm:mb-0" onClick={handleEventSelectModal}>
                        <img src="/assets/officeadmins/eventreport.jpeg" width={200} height={200} alt="eventReports" />
                        <p>Events Report</p>
                    </div>
                </div>
            </div>
            {eventSelectModal && (
                <Dialog open={eventSelectModal} onClose={handleEventSelectModalClose}>
                    <DialogTitle>Select an Event to submit report</DialogTitle>
                    <DialogContent>
                        <Select
                            value={selectedEvent}
                            onChange={handleEventSelection}
                        >
                            <MenuItem value="Select Event">Select Event</MenuItem>
                            {ownEvents.map((event, index) => (
                                <MenuItem key={index} value={event.eventName}>{event.eventName}</MenuItem>
                            ))}
                        </Select>
                    </DialogContent>
                </Dialog>
            )}
            {annualReportModal && (
                <Modal
                    open={annualReportModal}
                    onClose={handleAnnualModalClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', width: "50%" }}>
                        <h2 id="simple-modal-title">Upload Annual Report</h2>
                        <div class="flex items-center justify-center w-full mt-[1rem]">
                            <label for="approvalImage" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-200">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                                </div>
                                <input id="approvalImage" onChange={handleAnnualReportUpload} type="file" accept="application/pdf" className="hidden" />
                            </label>
                        </div>
                    </div>
                </Modal>
            )}
            {eventReportModal && (
                <Modal
                    open={eventReportModal}
                    onClose={handleEventReportModalClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', width: "50%" }}>
                        <h2 id="simple-modal-title">Upload Event Report</h2>
                        <div class="flex items-center justify-center w-full mt-[1rem]">
                            <label for="approvalImage" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-200">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                                </div>
                                <input id="approvalImage" onChange={handleEventReportUpload} type="file" accept="application/pdf" className="hidden" />
                            </label>
                        </div>
                    </div>
                </Modal>
            )}
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
