import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import path from 'path';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import jsPDF from "jspdf";


const EventReport = () => {
    const [events, setEvents] = useState([]);
    const [eventSummary, setEventSummary] = useState('');
    const [eventReport, setEventreport] = useState('');
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



    function printpdf() {
        let doc = new jsPDF();
        let text = document.getElementById('eventReport').value;
        let lines = doc.splitTextToSize(text, 180);
        let height = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        let lineHeight = doc.getLineHeight();
        let cursor = 50; // Start the cursor off below the header.
    
        // Add your images.
        let logo1 = "data:image/png;base64,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"; // Replace with your base64 image.
        // let logo2 = "https://ceconline.edu/wp-content/uploads/2018/11/cec_logo_300.png"; // Replace with your base64 image.
        doc.addImage(logo1, 'PNG', 10, 10, 30, 30);
        // doc.addImage(logo2, 'PNG', 160, 10, 30, 30);
    
        // Loop through each line.
        for (let i = 0; i < lines.length; i++) {
            // If adding another line would go past the height of the page, add a new page.
            if (cursor + lineHeight > height) {
                doc.addPage();
    
                // Add the images to each new page.
                doc.addImage(logo1, 'JPEG', 10, 10, 30, 30);
                doc.addImage(logo2, 'JPEG', 160, 10, 30, 30);
    
                cursor = 50; // Reset the cursor to below the header.
            }
    
            // Add the line and increment the cursor.
            doc.text(lines[i], 10, cursor);
            cursor += lineHeight;
        }
    
        doc.save("Report.pdf");
    }
    
    

    const handleback = () => {
        router.back();
    }

    const handleGenerateReport = () => {
        // Handle the report generation here
    }

  

    return (
        <>
            <div className="shadow-lg">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={160} onClick={handleback} className='cursor-pointer' />
                </div>
            </div>
            <div className="w-full flex flex-col items-center mt-10">
                <h1 className="text-2xl font-bold mb-4">Report Your Event Details here</h1>
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
                        <h2 className="text-lg font-bold mb-2">Event Summary</h2>
                        <textarea value={eventSummary} onChange={(e) => setEventSummary(e.target.value)} className="w-full p-2 mb-4 border rounded" rows="5"></textarea>
                        <button onClick={handleGenerateReport} className="p-2.5 bg-blue-500 rounded-xl text-white">Generate Report</button>
                        <h2 className="text-lg font-bold mb-2">Your Report is:</h2>
                        <textarea id="eventReport" value={eventReport} onChange={(e) => setEventreport(e.target.value)} className="w-full p-2 mb-4 border rounded" rows="5"></textarea>
                        <button onClick={printpdf} className="p-2.5 bg-blue-500 rounded-xl text-white">Print PDF</button>

                    </div>
                                        
                )
                }
            </div>
        </>
    )
}

export default EventReport
