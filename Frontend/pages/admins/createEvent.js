import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';


const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState(null);
    const router = useRouter();

    const currentDate = new Date().toISOString().substring(0, 10);
    const currentTime = new Date().toISOString().substring(11, 16);

    const handleHome = () => {
        router.push('/admins/admindb');
    }

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        const forumName = Cookies.get('forum');
        formData.append('eventName', eventName);
        formData.append('date', date);
        formData.append('time', time);
        formData.append('location', location);
        formData.append('image', image);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/events?forumName=${forumName}`, {
                method: 'POST',
                body: formData,
            });
            if (response.status === 200) {
                alert('Event created successfully');
                router.back();
            }
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <>
            <div className="App">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={200} />
                    <button onClick={handleHome} className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem]">Dashboard</button>
                </div>
            </div>
            <div className="w-full flex flex-col items-center mt-10">
                <form onSubmit={handleSubmit} className="w-1/2 p-4 border rounded mb-4 bg-gray-100">
                    <label className="block mb-2">
                        Event Name:
                        <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required className="mt-1 w-full p-2 border rounded" />
                    </label>
                    <label className="block mb-2">
                        Date:
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={currentDate} required className="mt-1 w-full p-2 border rounded" />
                    </label>
                    <label className="block mb-2">
                        Time:
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} min={currentTime} required className="mt-1 w-full p-2 border rounded" />
                    </label>
                    <label className="block mb-2">
                        Location:
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 w-full p-2 border rounded" />
                    </label>
                    <label className="block mb-2">
                        Upload Image:
                        <input type="file" onChange={handleImageUpload} accept="image/*" required className="mt-1 w-full p-2 border rounded" />
                    </label>
                    <div className="flex justify-center">
                        <button type="submit" className="p-2.5 bg-blue-500 rounded-xl text-white mb-4 w-[15%]" onClick={handleSubmit}>Create Event</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default CreateEvent;
