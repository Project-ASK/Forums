import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Select from 'react-select';
import QuestionModal from './QuestionModal';


const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState('');
    const [includesPayment, setIncludesPayment] = useState(false);

    const [tags, setTags] = useState([]);
    const options = [
        { value: 'AI', label: 'AI' },
        { value: 'Cybersecurity', label: 'Cybersecurity' },
        { value: 'Cloud', label: 'Cloud' },
        { value: 'Personality', label: 'Personality' },
        { value: 'Others', label: 'Others' },
    ];
    const [forums, setforums] = useState([]);
    const forumslist = [
        { value: 'IEDC', label: 'IEDC' },
        { value: 'IEEE', label: 'IEEE' },
        { value: 'None', label: 'None' },
    ];

    
    const [questions, setQuestions] = useState([]);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isNextQuestion, setIsNextQuestion] = useState(false);

    

    const handleAddQuestion = (question) => {
        // setQuestions([...questions, question]);
        // setIsQuestionModalOpen(false);
        // setIsNextQuestion(true); 
        
        setIsQuestionModalOpen(true);
    };
    const router = useRouter();

    const currentDate = new Date().toISOString().substring(0, 10);
    const currentTime = new Date().toISOString().substring(11, 16);

    const handleHome = () => {
        router.push('/admins/admindb');
    }
    const handleChange = (options) => {
        setSelectedOptions(options);
      };
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
        formData.append('description', description);


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
                        Upload Image:
                        <input type="file" onChange={handleImageUpload} accept="image/*" required className="mt-1 w-full p-2 border rounded" />
                    </label>
                    <label className="block mb-2">
                    Tags:                           {/* Added Tags */}
                    <Select
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
                    Collaberating With other Forums?                          {/* Added Tags */}
                    <Select
                        isMulti
                        name="forums"
                        options={forumslist}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOptions) => setforums(selectedOptions.map(forumslist => forumslist.value))}
                        value={forums ? forums.map(forums => ({ label: forums, value: forums })) : []}
                    />
                </label>
                <label className="block mb-2">
                    Does this event include payment?
                    <div className="mt-1">
                        <label style={{marginRight: '20px'}}>
                            <input type="radio" value="true" checked={includesPayment} onChange={(e) => setIncludesPayment(e.target.value === 'true')} />
                            Yes
                        </label>
                        <label>
                            <input type="radio" value="false" checked={!includesPayment} onChange={(e) => setIncludesPayment(e.target.value === 'true')} />
                            No
                        </label>
                    </div>
                </label>
{/* Adding questions from admin side to users */}
<label className="block mb-2">
                Do you want to ask other specific questions to participants?
                <div className="mt-1">
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="p-2.5 bg-blue-500 rounded-xl text-white"
                    >
                        Add Question
                    </button>
                    {isQuestionModalOpen && (
                        <QuestionModal
                            onClose={() => setIsQuestionModalOpen(false)}
                            onAddQuestion={(question) => {
                                setQuestions([...questions, question]);
                                setIsQuestionModalOpen(false);
                            }}
                        />
                    )}
                    {questions.length > 0 && (
                        <div className="mt-4">
                            <p>Added Questions:</p>
                            <ul>
                                {questions.map((q, index) => (
                                    <li key={index}>{q.question}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
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
