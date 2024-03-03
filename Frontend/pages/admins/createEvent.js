import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import Cookies from 'js-cookie';

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [description, setDescription] = useState('');
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
    const handleback = () => {
        router.back();
    }

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
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
        formData.append('image', image);
        formData.append('questions', JSON.stringify(questions));
        formData.append('description', description);
        formData.append('tags', JSON.stringify(tags)); // append tags
        formData.append('collabForums', JSON.stringify([...collabForums, forumName]));
        formData.append('amount', amount);

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
                    <img src="/assets/logo.png" width={200} onClick={handleback} />
                    <button onClick={handleHome} className="p-2.5 bg-blue-500 rounded-xl text-white mr-[1rem]">Dashboard</button>
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
                        Upload Image:
                        <input type="file" onChange={handleImageUpload} accept="image/*" required className="mt-1 w-full p-2 border rounded" />
                        {image && <img src={URL.createObjectURL(image)} alt="Preview" className="h-[25%] w-[25%] mt-3 mx-auto" />} {/* Show image preview */}
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
