import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import path from 'path'

const events = ({ username }) => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [events, setEvents] = useState([]);

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
        };
        fetchDetails();
    }, [username]);

    useEffect(() => {
        const fetchEvents = async () => {
            const responseEvents = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/officeadmin/getAllEvents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            const dataEvents = await responseEvents.json();
            setEvents(dataEvents.events);
        };

        fetchEvents();
    }, []);
    return (
        <>
            <div className="flex flex-row items-center bg-white justify-center w-full">
                <div className="w-[40%] flex flex-col justify-center items-center bg-[#FFFFFF] border-cyan-800 border-2 rounded-[40px] p-[20px] mt-[30px] mb-4">
                    <img src="/assets/logo.png" width={150} onClick={() => { router.back(); }} className='cursor-pointer relative bottom-4 xs:w-[7.9rem]' />
                    <p className="font-product-sans font-bold text-center md:text-2xl xs:text-lg mb-2">Welcome, {name}</p>
                </div>
            </div>
            <Grid item xs={12} className='pb-8'>
                <div className="lg:w-full flex flex-col items-center mt-10 xs:w-[70%] mx-auto">
                    {events && events.length > 0 ? (
                        events.map((event, index) => (
                            <div key={index} className="w-full md:w-3/4 lg:w-2/3 p-4 border rounded-2xl mb-4 bg-gray-300 flex flex-col md:flex-row items-center">
                                <div className="md:w-1/6 pr-2">
                                    <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, event.imagePath)} alt={event.eventName} width={100} height={100} layout="responsive" />
                                </div>
                                <div className="xs:mt-2 lg:mt-0 md:w-3/4 md:ml-[1rem]">
                                    <h2 className="text-lg font-bold">{event.eventName}</h2>
                                    <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{event.date}</p>
                                    <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{event.time}</p>
                                    <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{event.location}</p>
                                    {event.collabForums.length > 0 && (
                                        <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{event.collabForums.join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-[70%] mx-auto p-4 border rounded mb-4 bg-gray-300">
                            No events
                        </div>
                    )}
                </div>
            </Grid>
            <footer className="text-gray-600 body-font w-full">
                <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
                <div className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
                    <img src="/assets/authlogo.png" width={90} />
                    <span className="ml-3 text-xl">Forums CEC</span>
                </div>
                <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">© 2024 Forums CEC</p>
                </div>
            </footer>
        </>
    )
}

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

export default events