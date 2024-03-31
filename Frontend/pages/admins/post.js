import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import removeScript from '../../components/loadBot'
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatBubble = ({ text, timestamp }) => (
    <Box
        bgcolor={'primary.main'}
        color={'primary.contrastText'}
        p={1.8}
        my={1}
        alignSelf={'flex-end'}
        borderRadius={20} // Increase the border radius for a more rounded shape
        boxShadow={3} // Add a shadow for depth
        maxWidth="75%"
        minWidth="6%"
        sx={{ // Add custom CSS styles
            wordBreak: 'break-word', // Break long words into multiple lines
        }}
    >
        <Typography>{text}</Typography>
        <Typography variant="caption" color="textSecondary">{timestamp}</Typography>
    </Box>
);

const Post = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    removeScript("https://cdn.botpress.cloud/webchat/v1/inject.js");

    const chatContainerRef = useRef(null); // Add this line

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const fetchPostHistory = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fetchPosts`);
                if (!response.ok) {
                    throw new Error('Failed to fetch post history');
                }
                const data = await response.json();
                setMessages(data.flatMap(post => post.messages)); // Flatten the array of messages from all posts
            } catch (error) {
                console.error('Error fetching post history:', error);
            }
        };

        fetchPostHistory();
    }, []);

    const handleSend = async () => {
        const currentDate = new Date();
        const timestamp = currentDate.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
        const date = currentDate.toLocaleDateString();
        const newMessage = { message, timestamp };
        setMessages([...messages, newMessage]);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/postMessages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date, messages: [newMessage] }),
            });
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            toast.success('Event posted successfully.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } catch (error) {
            toast.error('Error posting message', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
        setMessage('');
    };

    return (
        <>
            <ToastContainer />
            <Box display="flex" flexDirection="column" height="100vh">
                <div className="flex bg-white shadow-lg w-full justify-start items-center">
                    <img src="/assets/logo.png" width={170} className='cursor-pointer' />
                </div>
                <Box flexGrow={1} p={2} overflow="auto" display="flex" flexDirection="column" ref={chatContainerRef}>
                    {/* Display local messages */}
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} text={msg.message} timestamp={msg.timestamp} />
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
        </>
    );
};

export default Post;