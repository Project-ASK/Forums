import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function forms() {
    const router = useRouter();
    const [about, setAbout] = useState('')
    const [branch, setBranch] = useState('')
    const [phone, setPhone] = useState('')
    const [reg, setReg] = useState('')
    const [year, setYear] = useState('')
    const [name, setName] = useState('')
    const [isloading, setIsLoading] = useState(false)
    const userName = Cookies.get('username');
    const [topics, setTopics] = useState([]);
    const tags = [
        { value: 'AI', label: 'AI' },
        { value: 'Cybersecurity', label: 'Cybersecurity' },
        { value: 'Cloud', label: 'Cloud' },
        { value: 'Web Development', label: 'Web Development' },
        { value: 'App Development', label: 'App Development' },
        { value: 'Personality', label: 'Personality' },
    ];

    useEffect(() => {
        const fetchDetails = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName }),
            });
            const data = await response.json();
            setName(data.name);
        };

        if (userName) {
            fetchDetails();
        }
    }, [userName]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, name, reg, phone, year, branch, about, topics }),
        });
        const data = await response.json();
        setIsLoading(false);
        if (data.message === 'User Updated') {
            toast.success('User Profile Updated', {
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
            //Clear all the values after update
            setReg('');
            setPhone('');
            setYear('');
            setBranch('');
            setAbout('');
            setTopics([]);
            setName('');
            router.back();
        } else {
            toast.error(data.message, {
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

    const handleHome = () => {
        router.back();
    }

    return (
        <>
            <ToastContainer/>
            <div className="flex bg-white w-full justify-between shadow-md">
                <img src="/assets/logo.png" width={160} onClick={handleHome} className="cursor-pointer" />
            </div>
            <div className="flex flex-col items-center min-h-screen py-2 mt-[2rem] xs:w-[80%] xs:mx-auto">
                <div className="flex flex-col items-center justify-center w-full text-center">
                    <h1 className="text-4xl font-bold text-blue-600">Edit Profile</h1>
                </div>
                <form className='w-full max-w-md mt-5'>
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="name">
                                Name
                            </label>
                            <input
                                id="name"
                                required
                                type='text'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                            />
                        </div>
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
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="year">
                                Year of Join
                            </label>
                            <input
                                id="year"
                                required
                                type='number'
                                maxLength={4}
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
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
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="about">
                                About
                            </label>
                            <textarea
                                id="about"
                                required
                                onChange={(e) => setAbout(e.target.value)}
                                value={about}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                            />
                        </div>
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="topic">
                                Topics of Interest
                            </label>
                            <Select
                                isMulti
                                name="forums"
                                options={tags}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={(selectedOptions) => setTopics(selectedOptions.map(tags => tags.value))}
                                value={topics ? topics.map(topic => ({ label: topic, value: topic })) : []}
                            />
                        </div>
                    </div>
                    <button
                        className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isloading}
                        onClick={handleUpdate}
                    >
                        {isloading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </>
    )
}
