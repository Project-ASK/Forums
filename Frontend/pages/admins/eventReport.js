import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const Editor = dynamic(
    () => import('jodit-pro-react').then((mod) => mod.default),
    { ssr: false }
);

const EventReport = () => {
    const [events, setEventDetails] = useState([]);
    const [content, setContent] = useState('');
    const router = useRouter();
    const eventId = Cookies.get('eventId');
    const [prompt,setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gemini');

    const handleChange = (event) => {
        setSelectedModel(event.target.value);
    };

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

    const handleRephraseWithAI = async () => {
        if(prompt!='')
        {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/genAI/prompt/${selectedModel}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: prompt }),
                })
                const data = await response.json();
                setContent(data.text);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
            setPrompt('');
        }else{
            toast.error('Prompt text can\'t be empty.', {
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
    }

    return (
        <>
            <ToastContainer/>
            <div className="shadow-lg">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={160} onClick={handleback} className='cursor-pointer' />
                </div>
            </div>
            <div className="w-full flex flex-col items-center mt-10 overflow-x-auto">
                <h1 className="text-2xl font-bold mb-4">Report Your Event Details here</h1>

                <div className="p-8 border rounded mb-4 bg-gray-200 flex-grow overflow-x-auto">
                    <h2 className="text-lg font-bold mb-2">Event Summary</h2>
                    <div>
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
                    </div>
                    <TextField id="outlined-basic" label="Enter prompt here" variant="outlined" value={prompt} onChange={(e) => setPrompt(e.target.value)} multiline className="w-full h-[4rem] mt-[5rem]" rows={3}/>
                    <div className="flex items-center">
                        <Button onClick={handleRephraseWithAI} variant="outlined" className="mt-[4rem]">
                            {loading ? (
                                <>
                                    <CircularProgress size={24} />
                                    <span className="ml-2">Generating ...</span>
                                </>
                            ) : (
                                'Rephrase with AI'
                            )}
                        </Button>
                        <FormControl sx={{ m: 1, minWidth: 120, marginTop:9, marginLeft:2 }} size="small">
                            <InputLabel id="demo-simple-select-helper-label">Model</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={selectedModel}
                                label="Model"
                                onChange={handleChange}
                            >
                                <MenuItem value="gemini">Google Gemini</MenuItem>
                                <MenuItem value="groq">Meta Llama3 (Faster)</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </div>
            <footer className="text-gray-600 body-font">
                <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
                    <div className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
                        <img src="/assets/authlogo.png" width={90} />
                        <span className="ml-3 text-xl">Forums CEC</span>
                    </div>
                    <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">© 2024 Forums CEC</p>
                </div>
            </footer>
        </>
    )
}

export default EventReport;
