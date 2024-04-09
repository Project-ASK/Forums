import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select';
import Chip from '@mui/material/Chip';
import CreatableSelect from 'react-select/creatable';
import Cookies from 'js-cookie';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [eventImage, setEventImage] = useState(null);
    const [approvalImage, setApprovalImage] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [description, setDescription] = useState('');
    const [eventVenue, setEventVenue] = useState('');
    const [includesPayment, setIncludesPayment] = useState(false);
    const [amount, setAmount] = useState(0);
    const router = useRouter();

    const forumName = Cookies.get('forum');

    const [tags, setTags] = useState([]);
    const options = [
        { value: 'AI', label: 'AI' },
        { value: 'Cybersecurity', label: 'Cybersecurity' },
        { value: 'Cloud', label: 'Cloud' },
        { value: 'Web Development', label: 'Web Development' },
        { value: 'App Development', label: 'App Development' },
        { value: 'Personality', label: 'Personality' },
    ];
    const [collabForums, setCollabForums] = useState([]);
    const forumslist = [
        { value: 'IEDC', label: 'IEDC' },
        { value: 'IEEE', label: 'IEEE' },
        { value: 'GDSC', label: 'GDSC' },
        { value: 'TINKERHUB', label: 'TINKERHUB' },
        { value: 'MULEARN', label: 'MULEARN' },
        { value: 'PRODDEC', label: 'PRODDEC' },
        { value: 'FOCES', label: 'FOCES' },
        { value: 'NSS', label: 'NSS' },
        { value: 'NCC', label: 'NCC' },
    ].filter(forum => forum.value !== forumName);

    const currentDate = new Date().toISOString().substring(0, 10);
    const currentTime = new Date().toISOString().substring(11, 16);

    const handleHome = () => {
        router.push('/admins/admindb');
    }

    const handleEventImageUpload = (event) => {
        setEventImage(event.target.files[0]);
    }

    const handleRemoveEventImage = () => {
        setEventImage(null);
    }

    const handleApprovalImageUpload = (event) => {
        setApprovalImage(event.target.files[0]);
    }

    const handleRemoveApprovalImage = () => {
        setApprovalImage(null);
    }

    const handleQuestionChange = (index, event) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [event.target.name]: event.target.value };
        setQuestions(updatedQuestions);
    }

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: " ", type: " " }]);
    }

    const handleRemoveQuestion = () => {
        const values = [...questions];
        values.pop();
        setQuestions(values);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        const forumName = Cookies.get('forum');
        formData.append('eventName', eventName);
        formData.append('date', date);
        formData.append('time', time);
        formData.append('location', location);
        formData.append('eventImage', eventImage);
        formData.append('approvalImage', approvalImage);
        formData.append('questions', JSON.stringify(questions));
        formData.append('description', description);
        formData.append('tags', JSON.stringify(tags)); // append tags
        formData.append('collabForums', JSON.stringify([...collabForums, forumName]));
        formData.append('amount', amount);
        formData.append('eventVenue', eventVenue);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/events?forumName=${forumName}&eventName=${eventName}`, {
                method: 'POST',
                body: formData,
            });
            if (response.status === 200) {
                toast.success('Event approval sent successfully', {
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
                router.back();
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="App">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={200} onClick={handleHome} />
                </div>
            </div>
            <div className="w-full flex flex-col items-center mt-10">
                <form onSubmit={handleSubmit} className="w-1/2 p-4 border rounded mb-4 bg-gray-100">
                    <label className="block mb-2">
                        Event Name:
                        <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required className="mt-1 w-full p-2 border rounded" />
                    </label>
                    <label className="block mb-2">  {/* Added Event Description */}
                        Event Description:
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 w-full p-2 border rounded" />
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
                        Venue:
                        <select value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} required className="mt-1 w-full p-2 border rounded">
                            <option value="">Select</option>
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                        </select>
                    </label>
                    <label className="block mb-2">
                        Tags:
                        <CreatableSelect
                            isMulti
                            name="tags"
                            options={options}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={(selectedOptions) => setTags(selectedOptions.map(option => option.value))}
                            value={tags ? tags.map(tag => ({ label: tag, value: tag })) : []}
                        />
                    </label>
                    <label className="block mb-2">
                        Collaberating With other Forums?
                        <Select
                            isMulti
                            name="forums"
                            options={forumslist}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={(selectedOptions) => setCollabForums(selectedOptions.map(forumslist => forumslist.value))}
                            value={collabForums ? collabForums.map(collabForums => ({ label: collabForums, value: collabForums })) : []}
                        />
                    </label>
                    <label className="block mb-2">
                        Does this event include payment?
                        <div className="mt-1">
                            <label style={{ marginRight: '20px' }}>
                                <input type="radio" value="true" checked={includesPayment} onChange={(e) => setIncludesPayment(e.target.value === 'true')} />
                                Yes
                            </label>
                            <label>
                                <input type="radio" value="false" checked={!includesPayment} onChange={(e) => setIncludesPayment(e.target.value === 'true')} />
                                No
                            </label>
                            {includesPayment &&
                                <label className="block mb-2">
                                    Amount:
                                    <input type="number" name="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 w-full p-2 border rounded" />
                                </label>}
                        </div>
                    </label>
                    {questions.map((question, index) => (
                        <div key={index}>
                            <label className="block mb-2">
                                Question:
                                <input type="text" name="question" value={question.question} onChange={event => handleQuestionChange(index, event)} className="mt-1 w-full p-2 border rounded" />
                            </label>
                            <label className="block mb-2">
                                Response Type:
                                <select name="type" value={question.type} onChange={event => handleQuestionChange(index, event)} className="mt-1 w-full p-2 border rounded">
                                    <option value="">Select type</option>
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                </select>
                            </label>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddQuestion} className="p-2.5 bg-blue-500 rounded-xl text-white mb-4 w-[15%]">Add Question</button>
                    <button type="button" onClick={handleRemoveQuestion} className="p-2.5 bg-blue-500 rounded-xl text-white mb-4 w-[18%] ml-[1rem]">Delete Question</button>
                    <label className="block mb-2">
                        Upload Event Image:
                        {!eventImage && (
                            <div class="flex items-center justify-center w-full mt-[1rem]">
                                <label for="eventImage" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-200">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                                        <br />
                                        <p class="text-xs text-gray-500 dark:text-gray-400">(1080 * 1080 Preferred)</p>
                                    </div>
                                    <input id="eventImage" onChange={handleEventImageUpload} type="file" accept="image/*" className="hidden" />
                                </label>
                            </div>
                        )}
                        {eventImage &&
                            <div className="flex flex-col items-center">
                                <img src={URL.createObjectURL(eventImage)} alt="Preview" className="h-[25%] w-[25%] mt-3 mx-auto" />
                                <Chip label="Remove Image" className="mt-[2rem]" color="error" onClick={handleRemoveEventImage} />
                            </div>
                        }
                    </label>
                    <label className="block mb-2 mt-[2rem]">
                        Staff Advisor Approval Letter:
                        {!approvalImage && (
                            <div class="flex items-center justify-center w-full mt-[1rem]">
                                <label for="approvalImage" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-200">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                                    </div>
                                    <input id="approvalImage" onChange={handleApprovalImageUpload} type="file" accept="image/*" className="hidden" />
                                </label>
                            </div>
                        )}
                        {approvalImage &&
                            <div className="flex flex-col items-center">
                                <img src={URL.createObjectURL(approvalImage)} alt="Preview" className="h-[25%] w-[25%] mt-3 mx-auto" />
                                <Chip label="Remove Image" className="mt-[2rem]" color="error" onClick={handleRemoveApprovalImage} />
                            </div>
                        }
                    </label>
                    <div className="flex justify-center">
                        <button type="submit" className="p-2.5 bg-blue-500 rounded-xl text-white mb-4 w-[15%]" onClick={handleSubmit}>Create Event</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    // Get username from cookies
    const username = context.req.cookies.adminUsername;

    // If username is not available, redirect to login
    if (!username) {
        return {
            redirect: {
                destination: '/adminAuth/login',
                permanent: false,
            },
        }
    }

    return {
        props: {}
    }
}

export default CreateEvent;
