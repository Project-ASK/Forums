import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie } from 'recharts';
import Cookies from 'js-cookie';

const Analytics = () => {
    const [data, setData] = useState([]);
    const [forum, setForum] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [totalEvents, setTotalEvents] = useState(0);
    const [pieData, setPieData] = useState([]);
    const [topicData, setTopicData] = useState([]);
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

                const total = Object.values(groupedEvents).reduce((acc, count) => acc + count, 0);
                setTotalEvents(total);

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

                const tagCounts = {};
                events.forEach(event => {
                    event.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                });

                // Convert tag counts to percentage
                const totalEvents = events.length;
                const piedata = Object.keys(tagCounts).map(tag => ({
                    name: tag,
                    value: (tagCounts[tag] / totalEvents) * 100,
                }));

                const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getOrganizationMembers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ org: forum }),
                });
                const usersResult = await usersResponse.json();
                const users = usersResult.users;

                // Calculate the percentage of each topic for each user
                const userTopicCounts = {};
                users.forEach(user => {
                    user.topics.forEach(topic => {
                        userTopicCounts[topic] = (userTopicCounts[topic] || 0) + 1;
                    });
                });

                const totalUsers = users.length;
                const userPieData = Object.keys(userTopicCounts).map(topic => ({
                    name: topic,
                    value: (userTopicCounts[topic] / totalUsers) * 100,
                }));

                setData(chartData);
                setPieData(piedata);
                setTopicData(userPieData);
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
                <div className='bg-gray-200 min-h-[150vh]'>
                    <div className="flex bg-white w-full justify-between items-center bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-md absolute top-2">
                        <img src="/assets/logo.png" width={150} onClick={handleHomeClick} className='cursor-pointer' />
                        <div className="flex items-center justify-center">
                            <h1 className="text-2xl font-bold text-center">Analytics</h1>
                        </div>
                        <div style={{ width: '150px' }} />
                    </div>
                    <div className="mx-auto shadow-xl bg-white rounded-xl overflow-hidden max-w-7xl mt-10 p-10 relative top-[6rem]">
                        <h1 className="text-3xl font-bold text-left mt-10 relative bottom-[2rem]">Month vs Events</h1>
                        {/* <div className="flex justify-end mb-4">
                            <input type="month" placeholder="Start Month" value={startMonth} onChange={e => setStartMonth(e.target.value)} className="mr-4 p-2 border border-gray-300 rounded" />
                            <input type="month" placeholder="End Month" value={endMonth} onChange={e => setEndMonth(e.target.value)} className="p-2 border border-gray-300 rounded" />
                        </div> */}
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
                        <div className="bg-gray-100 p-4 mt-4">
                            <span className="relative left-[2rem]"><span className="font-product-sans">Total Events in this period:</span> {totalEvents}</span>
                        </div>
                    </div>

                    <div className="flex mx-auto shadow-xl bg-white rounded-xl overflow-hidden max-w-7xl mt-10 p-10 relative top-[6rem]">
                        <div style={{ flex: '0 0 50%', padding: '1rem' }}>
                            <h1 className="text-3xl font-bold text-left relative bottom-[1rem]">Tags Distribution</h1>
                            <PieChart width={600} height={400}>
                                <Pie
                                    data={pieData}
                                    cx={230}
                                    cy={200}
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>
                        <div style={{ flex: '0 0 50%', padding: '1rem' }}>
                            <h1 className="text-3xl font-bold text-left relative bottom-[1rem]">User Interests</h1>
                            <PieChart width={600} height={400}>
                                <Pie
                                    data={topicData}
                                    cx={300}
                                    cy={200}
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                                    outerRadius={80}
                                    fill="rgb(12, 92, 33)"
                                    dataKey="value"
                                />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>
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
