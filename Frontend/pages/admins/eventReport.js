import { useState, useEffect } from 'react';
import Image from 'next/image';
import path from 'path';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Editor = dynamic(
    () => import('jodit-pro-react').then((mod) => mod.default),
    { ssr: false }
);

const EventReport = () => {
    const [events, setEventDetails] = useState([]);
    const [content, setContent] = useState('');
    const router = useRouter();
    const eventId = Cookies.get('eventId');

    useEffect(() => {
        const fetchEventDetails = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getEventDetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventId }),
            });
            const data = await response.json();
            setEventDetails(data.event);
        };

        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

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
                <h1 className="text-2xl font-bold mb-4">Report Your Event Details here</h1>

                <div className="p-8 border rounded mb-4 bg-gray-200">
                    <h2 className="text-lg font-bold mb-2">Event Summary</h2>
                    <Editor
                        value={content}
                        onChange={setContent}
                        config={{
                            height: 500,
                            showCharsCounter: true, // Hide character counter
                            showWordsCounter: true, // Hide word counter
                            uploader: {
                                insertImageAsBase64URI: true, // Enable inserting images as Base64 URIs
                                insertVideoAsBase64URI: true, // Enable inserting videos as Base64 URIs
                            },
                        }}
                        tabIndex={1} // tabIndex of textarea
                        style={{
                            '& ul': {
                                listStyleType: 'disc',
                                color: 'black',
                            },
                            '& ol': {
                                listStyleType: 'decimal',
                                color: 'black',
                            },
                        }}
                    />
                    {/* <button onClick={handleGenerateReport} className="p-2.5 bg-blue-500 rounded-xl text-white mt-[2rem]">Print PDF</button> */}
                </div>
            </div>
        </>
    )
}

export default EventReport;
