import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import path from 'path';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const EventReport = () => {
    const [events, setEvents] = useState([]);
    const router = useRouter();
    const forum = Cookies.get('forum'); // Get the forum from the cookie

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
                setEvents(dataEvents.events);
            }
        };

        fetchEvents();
    }, []);

    const handleback = () => {
        router.back();
    }

    return (
        <>
            <div className="shadow-lg">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={160} onClick={handleback} className='cursor-pointer' />
                </div>
            </div>
            <div className="w-full flex flex-col items-center mt-10">
                <h1 className="text-2xl font-bold mb-4">Select the event for which report is to be generated:</h1>
                {events && events.length > 0 ? (
                    events.map((event, index) => (
                        <div key={index} className="w-1/2 p-4 border rounded-lg mb-4 bg-gray-300 flex" onClick={() => {
                            Cookies.set('eventId', event._id); // Set the event id as a cookie
                            router.push(`/admins/eventReportGeneration`); // Navigate to the eventReportGeneration page
                        }}>
                            <div className="w-1/6 pr-2"> {/* Add some padding to the right of the image */}
                                <Image src={path.join(process.env.NEXT_PUBLIC_BACKEND_URL, event.imagePath)} alt={event.eventName} width={100} height={100} layout="responsive" />
                            </div>
                            <div className="w-1/2 cursor-pointer ml-[1rem]"> {/* Add some padding to the left of the text */}
                                <h2 className="text-lg font-bold">Name: {event.eventName}</h2> {/* Make the event name larger and bold */}
                                <p className="text-md text-gray-500"><span className='font-bold'>Date: </span>{event.date}</p> {/* Make the date smaller and gray */}
                                <p className="text-md text-gray-500"><span className='font-bold'>Time: </span>{event.time}</p> {/* Make the time smaller and gray */}
                                <p className="text-md text-gray-500"><span className='font-bold'>Location: </span>{event.location}</p> {/* Make the location smaller and gray */}
                                {event.collabForums.filter(forumName => forumName !== forum).length > 0 && (
                                    <p className="text-md text-gray-500"><span className='font-bold'>Collaborating Forums: </span>{event.collabForums.filter(forumName => forumName !== forum).join(', ')}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-1/2 p-4 border rounded mb-4 bg-gray-300">
                        No events
                    </div>
                )}
            </div>
        </>
    )
}

export default EventReport
