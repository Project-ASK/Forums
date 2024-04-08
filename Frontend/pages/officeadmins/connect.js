import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { Box, TextField, IconButton, Divider } from '@mui/material';
import socketIOClient from 'socket.io-client';
import removeScript from '../../components/loadBot';
import SendIcon from '@mui/icons-material/Send';

const ChatBubble = ({ text, timestamp, isUser }) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3.5 mb-4`}>
        <div className={` ${isUser ? 'bg-blue-600' : 'bg-orange-400'} flex flex-col w-[60%] max-w-[320px] leading-1.5 p-2.5 border-gray-200 rounded-e-xl rounded-es-xl`}>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {!isUser && (
                    <span className="text-md font-bold text-gray-900 dark:text-white">
                        Forum Admin
                    </span>
                )}
                {isUser && (
                    <span className="text-md font-bold text-gray-900 dark:text-white">
                        Office Admin
                    </span>
                )}
                <span className="text-md font-normal text-white">
                    {timestamp}
                </span>
            </div>
            <p className="text-md font-normal py-2.5 text-white">
                {text}
            </p>
        </div>
    </div>
);

const Connect = () => {
    const [forum, setForum] = useState('');
    const [adminId, setAdminId] = useState('');
    const [officeId, setOfficeId] = useState('');
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    removeScript("https://cdn.botpress.cloud/webchat/v1/inject.js");
    const socket = useRef(null);

    const chatContainerRef = useRef(null); // Add this line

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    useEffect(() => {
        const officeID = Cookies.get('officeId');
        setOfficeId(officeID);
        const selectedForum = Cookies.get('selectedForum');
        setForum(selectedForum);
        const fetchForums = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAdminByForum`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ forum: selectedForum }),
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch admin data');
                }
                const data = await response.json();
                setAdminId(data.adminId);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            }
        };
        fetchForums();
    }, []);

    useEffect(() => {
        socket.current = socketIOClient(process.env.NEXT_PUBLIC_BACKEND_URL);

        fetchChatHistory();
        // Listen for incoming messages from the admin
        socket.current.on(`message_${adminId}_${officeId}`, (data) => {
            const formattedTimestamp = new Date(data.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const date = new Date(data.timestamp).toLocaleDateString();
            const newMessage = { message: data.text, sender: data.sender, timestamp: formattedTimestamp, isUser: false };
            setChatMessages(prevMessages => {
                if (prevMessages[date]) {
                    return { ...prevMessages, [date]: [...prevMessages[date], newMessage] };
                } else {
                    return { ...prevMessages, [date]: [newMessage] };
                }
            });
        });

        return () => {
            // Clean up socket connection when component unmounts
            socket.current.disconnect();
        };
    }, [adminId, officeId]); // Remove chatMessages from the dependency array

    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chatHistory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ officeId, adminId }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }
            const data = await response.json();
            const chatHistory = data.chatByDate.reduce((acc, day) => {
                const date = new Date(day.date).toLocaleDateString();
                const messages = day.messages.map(msg => {
                    const formattedTimestamp = new Date(msg.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                    const isUser = msg.sender === adminId;
                    return { ...msg, timestamp: formattedTimestamp, isUser };
                });
                acc[date] = messages;
                return acc;
            }, {});
            setChatMessages(chatHistory);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleSend = () => {
        const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const date = new Date().toLocaleDateString();
        const newMessage = { message, sender: officeId, receiver: adminId, timestamp }; // Assuming you always send from office to admin
        setChatMessages(prevMessages => {
            if (prevMessages[date]) {
                return { ...prevMessages, [date]: [...prevMessages[date], newMessage] };
            } else {
                return { ...prevMessages, [date]: [newMessage] };
            }
        }); // Update local state
        const eventName = `message_${officeId}_${adminId}`;
        socket.current.emit(eventName, { text: message, officeId, adminId });
        setMessage('');
    };

    return (
        <Box display="flex" flexDirection="column" height="100vh">
            <Box bgcolor="grey.200" p={2}>
                Connected to {forum} admin
                <br />
                Forum Admin ID: {adminId}
                <br />
                My ID: {officeId}
            </Box>
            <Box flexGrow={1} p={2} overflow="auto" display="flex" flexDirection="column" ref={chatContainerRef}>
                {Object.entries(chatMessages).map(([date, messages]) => (
                    <React.Fragment key={date}>
                        <Divider>{new Date(date).toLocaleDateString('en-US', {year: 'numeric',month: 'long',day: 'numeric'})}</Divider>
                        {messages.map((msg, index) => (
                            <ChatBubble key={index} text={msg.message} timestamp={msg.timestamp} isUser={msg.sender === officeId} />
                        ))}
                    </React.Fragment>
                ))}
            </Box>
            <Box p={2} display="flex" className="relative bottom-[2rem]" style={{ zIndex: 1 }}>
                <TextField
                    variant="outlined"
                    focused
                    label="Message"
                    placeholder="Type a message"
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Box className="rounded-full ml-2 overflow-hidden mt-2 hover:bg-light-blue-500" > {/* Apply borderRadius and overflow:hidden */}
                    <IconButton color="primary" onClick={handleSend} sx={{
                        '&:hover': {
                            backgroundColor: 'lightblue',
                        },
                    }}>
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default Connect;
