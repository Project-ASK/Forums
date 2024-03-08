import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Cookies from 'js-cookie';

const Analytics = () => {
    const [data, setData] = useState([]);
    const [forum, setForum] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1303) {
                setIsMobileView(true);
            } else {
                setIsMobileView(false);
            }
        };
        handleResize(); // Call once to set initial value
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    useEffect(() => {
        const fetchForum = () => {
            const forumCookie = Cookies.get('forum');
            setForum(forumCookie || '');
        };

        fetchForum();

        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getEvents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ forum }),
                });
                const result = await response.json();
                const events = result.events;
                const groupedEvents = events.reduce((acc, event) => {
                    const monthYear = new Date(event.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                    acc[monthYear] = (acc[monthYear] || 0) + 1;
                    return acc;
                }, {});

                // Generate the last 5 months and next 5 months
                const date = new Date();
                const months = [];
                for (let i = -5; i <= 5; i++) {
                    const newDate = new Date(date.getFullYear(), date.getMonth() + i, 1);
                    const monthYear = newDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                    months.push(monthYear);
                }

                // Ensure all months are included in the data
                const chartData = months.map(monthYear => ({
                    name: monthYear,
                    value: groupedEvents[monthYear] || 0,
                }));

                setData(chartData);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchData();
    }, [forum]);

    const handleHomeClick = () => {
        router.back();
    }

    return (
        <>
            {!isMobileView ? (
                <div className='bg-gray-200 h-screen'>
                    <div className="flex bg-white w-full justify-between items-center bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-md absolute top-2">
                        <img src="/assets/logo.png" width={150} onClick={handleHomeClick} className='cursor-pointer' />
                        <div className="flex items-center justify-center">
                            <h1 className="text-2xl font-bold text-center">Analytics</h1>
                        </div>
                        <div style={{ width: '150px' }} />
                    </div>
                    <div className="mx-auto shadow-xl bg-white rounded-xl overflow-hidden max-w-7xl mt-10 p-10 relative top-[6rem]">
                        <h1 className="text-3xl font-bold text-left mt-10 relative bottom-[2rem]">Month vs Events</h1>
                        <BarChart
                            width={1500}
                            height={300}
                            data={data}
                            margin={{
                                top: 6, right: 340, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={0} angle={-10} textAnchor="middle" />
                            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                            <Tooltip />
                            {/* <Legend /> */}
                            <Bar dataKey="value" name="Events" fill="rgb(36, 17, 239)" barSize={60} />
                        </BarChart>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md">
                        <img src="/assets/logo.png" width={110} className="mx-auto" />
                    </div>
                    <div className="flex justify-center items-center h-screen">
                        <div className="bg-white shadow-xl rounded-xl p-8">
                            <p className="text-lg">This page is not visible on mobile. Please use a desktop view.</p>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Analytics;
