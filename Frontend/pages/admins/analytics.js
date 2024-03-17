import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, LineChart, Line } from 'recharts';
import Cookies from 'js-cookie';

const Analytics = () => {
    const [data, setData] = useState([]);
    const [forum, setForum] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [totalEvents, setTotalEvents] = useState(0);
    const [pieData, setPieData] = useState([]);
    const [topicData, setTopicData] = useState([]);
    const [eventData, setEventData] = useState([]);
    const [venueData, setVenueData] = useState([]);
    const [startMonth, setStartMonth] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [participationData, setParticipationData] = useState([]);
    const [adminEvents, setAdminEvents] = useState([]);
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
                setAdminEvents(Array.isArray(result.events) ? result.events : []);
                let events = result.events;
                if (startMonth && endMonth) {
                    events = events.filter(event => {
                        const eventMonthYear = new Date(event.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                        return event.date >= startMonth && event.date <= endMonth;
                    });
                }
                const groupedEvents = events.reduce((acc, event) => {
                    const monthYear = new Date(event.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                    acc[monthYear] = (acc[monthYear] || 0) + 1;
                    return acc;
                }, {});

                let total = 0;
                Object.values(groupedEvents).forEach(value => {
                    total += value;
                });
                setTotalEvents(total);

                // Generate the last 5 months and next 5 months
                let startDate = new Date(startMonth || Date.now());
                let endDate = new Date(endMonth || Date.now());
                const months = [];
                
                if (!startMonth && !endMonth) {
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 5, 1);
                }
                
                const currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const monthYear = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                    months.push(monthYear);
                    currentDate.setMonth(currentDate.getMonth() + 1);
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

                const eventCounts = {};
                events.forEach(event => {
                    const monthYear = new Date(event.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                    eventCounts[monthYear] = (eventCounts[monthYear] || 0) + 1;
                });

                const eventData = Object.keys(eventCounts).map(monthYear => ({
                    name: monthYear,
                    events: eventCounts[monthYear],
                }));

                const venueCounts = { Online: 0, Offline: 0 };
                events.forEach(event => {
                    if (event.eventVenue === 'Online') {
                        venueCounts.Online += 1;
                    } else if (event.eventVenue === 'Offline') {
                        venueCounts.Offline += 1;
                    }
                });

                const totalVenues = venueCounts.Online + venueCounts.Offline;
                const venuePieData = Object.keys(venueCounts).map(venue => ({
                    name: venue,
                    value: (venueCounts[venue] / totalVenues) * 100,
                }));

                setEventData(eventData);
                setData(chartData);
                setPieData(piedata);
                setTopicData(userPieData);
                setVenueData(venuePieData);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchData();
    }, [forum, startMonth, endMonth]);

    useEffect(() => {
        if (selectedEvent) {
            // Fetch the participation data for the selected event
            const fetchParticipationData = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/event/getUsers`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ eventName: selectedEvent }),
                    });
                    const result = await response.json();
                    const attendedCount = result.users.filter((user) => {
                        const event = user.joinedEvents.find(event => event.eventName === selectedEvent);
                        return event && event.isAttended;
                    }).length;
                    const notAttendedCount = result.users.length - attendedCount;
                    setParticipationData([
                        { name: 'Attended', value: attendedCount },
                        { name: 'Not Attended', value: notAttendedCount },
                    ]);
                    console.log('selectedEvent:', selectedEvent);
                    console.log('fetch response:', result);
                } catch (error) {
                    console.error('Failed to fetch participation data:', error);
                }
            };

            fetchParticipationData();
        }
    }, [selectedEvent]);

    const handleHomeClick = () => {
        router.back();
    }

    const handleStartDateChange = (e) => {
        setStartMonth(e.target.value);
    }

    const handleEndDateChange = (e) => {
        setEndMonth(e.target.value);
    }

    return (
        <>
            {!isMobileView ? (
                <div className='bg-gray-200 min-h-[290vh]'>
                    <div className="flex bg-white w-full justify-between items-center bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl shadow-md absolute top-2">
                        <img src="/assets/logo.png" width={150} onClick={handleHomeClick} className='cursor-pointer' />
                        <div className="flex items-center justify-center">
                            <h1 className="text-2xl font-bold text-center">Analytics</h1>
                        </div>
                        <div style={{ width: '150px' }} />
                    </div>
                    <div className="mx-auto shadow-xl bg-white rounded-xl overflow-hidden max-w-7xl mt-10 p-10 relative top-[6rem]">
                        <h1 className="text-3xl font-bold text-left mt-10 relative bottom-[2rem]">Month vs Events</h1>
                        <div className="flex justify-end mb-4">
                            <span className="font-product-sans relative top-[0.5rem] right-[0.5rem]">Start Month:</span>
                            <input type="month" placeholder="Start Month" value={startMonth} onChange={handleStartDateChange} className="mr-4 p-2 border border-gray-300 rounded" />
                            <span className="font-product-sans relative top-[0.5rem] right-[0.5rem]">End Month:</span>
                            <input type="month" placeholder="End Month" value={endMonth} onChange={handleEndDateChange} className="p-2 border border-gray-300 rounded" />
                        </div>
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
                        <div className="bg-gray-200 p-4 mt-4 rounded-xl">
                            <span className="relative left-[2rem]"><span className="font-product-sans">Total Events in this period:</span> {totalEvents}</span>
                        </div>
                    </div>

                    <div className="flex mx-auto shadow-xl bg-white rounded-xl overflow-hidden max-w-7xl mt-10 p-10 relative top-[6rem]">
                        <div style={{ flex: '0 0 50%', padding: '1rem' }}>
                            <h1 className="text-3xl font-bold text-left relative bottom-[1rem]">Tags Distribution</h1>
                            <PieChart width={600} height={400}>
                                <Pie
                                    data={pieData}
                                    cx={280}
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

                    <div className="mx-auto shadow-xl bg-white rounded-xl overflow-hidden max-w-7xl mt-10 p-10 relative top-[6rem]">
                        <h1 className="text-3xl font-bold text-left mt-10 relative bottom-[2rem]">Events per Month</h1>
                        <LineChart
                            width={1500}
                            height={300}
                            data={eventData}
                            margin={{
                                top: 6, right: 340, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={0} angle={-10} textAnchor="middle" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="events" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </div>

                    <div className="flex mx-auto shadow-xl bg-white rounded-xl overflow-hidden max-w-7xl mt-10 p-10 relative top-[6rem]">
                        <div style={{ flex: '0 0 50%', padding: '1rem' }}>
                            <h1 className="text-3xl font-bold text-left relative bottom-[1rem]">Event Venue Distribution</h1>
                            <PieChart width={600} height={400}>
                                <Pie
                                    data={venueData}
                                    cx={280}
                                    cy={200}
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                                    outerRadius={80}
                                    fill="blue"
                                    dataKey="value"
                                />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>
                        <div style={{ flex: '0 0 50%', padding: '1rem' }}>
                            <h1 className="text-3xl font-bold text-left relative bottom-[1rem]">Event Participation</h1>
                            <div className="flex gap-4">
                                <h1 className="text-lg font-bold text-left">Select Event Name</h1>
                                <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="border-[2px] rounded">
                                    {adminEvents.sort((a, b) => a.eventName.localeCompare(b.eventName)).map((event) => (
                                        <option key={event._id} value={event.eventName}>
                                            {event.eventName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <PieChart width={600} height={400}>
                                <Pie
                                    data={participationData}
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