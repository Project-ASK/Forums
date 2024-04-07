import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { Box, Typography, TextField, IconButton, Divider } from '@mui/material';
import socketIOClient from 'socket.io-client';
import removeScript from '../../../components/loadBot'
import SendIcon from '@mui/icons-material/Send';

// const ChatBubble = ({ text, timestamp, isUser }) => (
//     <Box
//         bgcolor={isUser ? 'primary.main' : 'secondary.main'}
//         color={isUser ? 'primary.contrastText' : 'secondary.contrastText'}
//         p={2}
//         my={1}
//         alignSelf={isUser ? 'flex-end' : 'flex-start'}
//         borderRadius={16}
//         maxWidth="75%"
//         minWidth="6%"
//     >
//         <Typography>{text}</Typography>
//         <Typography variant="caption" color="textSecondary">{timestamp}</Typography>
//     </Box>
// );

// const ChatBubble = ({ text, timestamp, isUser }) => (
//     <Box
//         bgcolor={isUser ? 'primary.main' : 'secondary.main'}
//         color={isUser ? 'primary.contrastText' : 'secondary.contrastText'}
//         p={1.8}
//         my={1}
//         alignSelf={isUser ? 'flex-end' : 'flex-start'}
//         borderRadius={20} // Increase the border radius for a more rounded shape
//         boxShadow={3} // Add a shadow for depth
//         maxWidth="75%"
//         minWidth="6%"
//         sx={{ // Add custom CSS styles
//             wordBreak: 'break-word', // Break long words into multiple lines
//         }}
//     >
//         <Typography>{text}</Typography>
//         <Typography variant="caption" color="textSecondary">{timestamp}</Typography>
//     </Box>
// );

const ChatBubble = ({ text, timestamp, isUser, forum }) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3.5 mb-4`}>
        <div className={` ${isUser ?  'bg-blue-500' : 'bg-orange-400'} flex flex-col w-[60%] max-w-[320px] leading-1.5 p-2.5 border-gray-200 rounded-e-xl rounded-es-xl`}>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {!isUser && (
                    <span className="text-md font-bold text-gray-900 dark:text-white">
                        Forum Admin
                    </span>
                )}
                {isUser && (
                    <span className="text-md font-product-sans font-bold text-gray-900 dark:text-white">
                        Office Admin
                    </span>
                )}
                <span className="text-md font-product-sans font-normal text-white">
                    {timestamp}
                </span>
            </div>
            <p className="text-md font-product-sans font-normal py-2.5 text-white">
                {text}
            </p>
        </div>
    </div>
);

const Chat = () => {
    const [officeId, setOfficeId] = useState('');
    const [adminId, setAdminId] = useState('');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [forum, setForum] = useState('');
    removeScript("https://cdn.botpress.cloud/webchat/v1/inject.js");
    const socket = useRef(null);

    const chatContainerRef = useRef(null); // Add this line

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const fetchOfficeAdmin = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/officeadminId`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                setOfficeId(data.officeId);
            } catch (error) {
                console.error('Error fetching office admin ID:', error);
            }
        };
        fetchOfficeAdmin();
    }, []);

    useEffect(() => {
        socket.current = socketIOClient(process.env.NEXT_PUBLIC_BACKEND_URL);
        const adminID = Cookies.get('adminId');
        const forumName = Cookies.get('forum');
        setAdminId(adminID);
        setForum(forumName);
        fetchChatHistory();
        // Listen for incoming messages from the admin
        socket.current.on(`message_${officeId}_${adminId}`, (data) => {
            // const formattedTimestamp = new Date(data.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            // // Update chat messages with the new message
            // setMessages(prevMessages => [...prevMessages, { message: data.text, sender: data.sender, timestamp: formattedTimestamp, isUser: false }]);

            const formattedTimestamp = new Date(data.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const date = new Date(data.timestamp).toLocaleDateString();
            const newMessage = { message: data.text, sender: data.sender, timestamp: formattedTimestamp, isUser: false };
            setMessages(prevMessages => {
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
                body: JSON.stringify({ officeId, adminId }), // No need to swap sender and receiver
            });
            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }
            const data = await response.json();
            // const chatHistory = data.chatHistory.map(msg => ({
            //     ...msg,
            //     timestamp: new Date(msg.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
            //     isUser: msg.sender === officeId // Set isUser flag based on the sender
            // }));
            const chatHistory = data.chatHistory.reduce((acc, msg) => {
                const date = new Date(msg.timestamp).toLocaleDateString();
                const formattedTimestamp = new Date(msg.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                const isUser = msg.sender === officeId;
                const newMsg = { ...msg, timestamp: formattedTimestamp, isUser };
                if (acc[date]) {
                    acc[date].push(newMsg);
                } else {
                    acc[date] = [newMsg];
                }
                return acc;
            }, {});
            setMessages(chatHistory);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    // const handleSend = () => {
    //     const newMessage = { message, sender: adminId, receiver: officeId, timestamp: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) }; // Assuming you always send from office to admin
    //     setMessages(prevMessages => [...prevMessages, newMessage]); // Update local state
    //     const eventName = `message_${adminId}_${officeId}`;
    //     socket.current.emit(eventName, { text: message, officeId, adminId });
    //     setMessage('');
    // };

    const handleSend = () => {
        const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const date = new Date().toLocaleDateString();
        const newMessage = { message, sender: adminId, receiver: officeId, timestamp }; // Assuming you always send from office to admin
        setMessages(prevMessages => {
            if (prevMessages[date]) {
                return { ...prevMessages, [date]: [...prevMessages[date], newMessage] };
            } else {
                return { ...prevMessages, [date]: [newMessage] };
            }
        }); // Update local state
        const eventName = `message_${adminId}_${officeId}`;
        socket.current.emit(eventName, { text: message, officeId, adminId });
        setMessage('');
    };


    return (
        <Box display="flex" flexDirection="column" height="100vh">
            <Box bgcolor="grey.200" p={2}>
                Connected to Office Admin
                <br />
                ID: {officeId}
                <br />
                My ID: {adminId} {forum}
            </Box>
            <Box flexGrow={1} p={2} overflow="auto" display="flex" flexDirection="column" ref={chatContainerRef}>
                {Object.entries(messages).map(([date, message]) => (
                    <React.Fragment key={date}>
                        <Divider>{date}</Divider>
                        {message.map((msg, index) => (
                            <ChatBubble key={index} text={msg.message} timestamp={msg.timestamp} isUser={msg.sender === adminId} />
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

export default Chat;