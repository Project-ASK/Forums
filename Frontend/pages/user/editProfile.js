import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function forms() {
    const router = useRouter()
    const [About, setAbout] = useState(' ')
    const [branch, setBranch] = useState(' ')
    const [phone,setPhone] = useState('')
    const [reg, setReg] = useState(' ')
    const [isloading, setIsLoading] = useState(false)
    const [topics, setTopics] = useState([])

    const topic = ['AI/ML', 'Cybersecurity', 'Web Development', 'Cloud', 'Android Development']; // Add your topics here

    const handleTopicChange = (e) => {
        if (e.target.checked) {
            setTopics([...topics, e.target.value]);
        } else {
            setTopics(topics.filter(topic => topic !== e.target.value));
        }
    }

    return (
        <>
            <div className="flex bg-white w-full justify-between shadow-md">
                <img src="/assets/logo.png" width={160} />
            </div>
            <div className="flex flex-col items-center min-h-screen py-2 mt-[2rem] xs:w-[80%] xs:mx-auto">
                <div className="flex flex-col items-center justify-center w-full text-center">
                    <h1 className="text-4xl font-bold text-blue-600">Edit Profile</h1>
                </div>
                <form className='w-full max-w-md mt-5'>
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="reg">
                                Reg No
                            </label>
                            <input
                                id="reg"
                                required
                                type='text'
                                onChange={(e) => setReg(e.target.value)}
                                value={reg}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                            />
                        </div>
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="phone">
                                Phone No
                            </label>
                            <input
                                id="phone"
                                required
                                type='tel'
                                maxLength={10}
                                pattern="\d{10}"
                                onChange={(e) => {
                                    // Ensure that it's a number and stop the keypress
                                    if (isNaN(e.target.value)) {
                                        e.preventDefault();
                                    } else {
                                        setPhone(e.target.value)
                                    }
                                }}
                                value={phone}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                            />
                        </div>
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="branch">
                                Branch
                            </label>
                            <input
                                id="branch"
                                required
                                type='text'
                                onChange={(e) => setBranch(e.target.value)}
                                value={branch}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                            />
                        </div>
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="About">
                                About
                            </label>
                            <textarea
                                id="About"
                                required
                                onChange={(e) => setAbout(e.target.value)}
                                value={About}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                            />
                        </div>
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="topic">
                                Topic of Interests
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                                {topic.map((topic, index) => (
                                    <div key={index} className="flex items-center">
                                        <input type="checkbox" id={topic} name={topic} value={topic} className="scale-100" onChange={handleTopicChange} />
                                        <label htmlFor={topic} className="ml-1 text-sm">{topic}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isloading}
                    >
                        {isloading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </>
    )
}
