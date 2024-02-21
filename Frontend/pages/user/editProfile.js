import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function forms(){
    const router = useRouter()

    const [username, setUsername] = useState(' ')
    const [About, setBody] = useState(' ')
    const [password, setPassword] = useState('')
    const [batch, setBatch] = useState(' ')
    const [year, setYear] = useState(' ')
    const [isloading, setIsLoading] = useState(false)
    const [topic, setTopic] = useState('')
    const [email, setEmail] = useState('')

    const topics = ['AI/ML', 'Cybersecurity', 'Web Development', 'Cloud', 'Android Development']; // Add your topics here

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '5px'
    };

    const labelStyle = {
        marginBottom: '10px'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #ddd',
        borderRadius: '5px'
    };

    const buttonStyle = {
        marginTop: '20px',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007BFF',
        color: 'white',
        cursor: 'pointer'
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#ccc',
        cursor: 'not-allowed'
    };
    fetch('/fetch-email')
  .then(response => response.json())
  .then(email => {
    // Set the email as the value of the input field
    document.getElementById('email').value = email;
  })
  .catch(error => console.error('Error:', error));


    return (
        <div>
            <div style={{width: '100%', background: '#f8f9fa', textAlign: 'center', padding: '30px' }}>
                <h1>Your Profile</h1>
            </div>
            <form className='w' style={formStyle}>
            <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between'}}>
            <span>Email:</span>
            <input
                id="email"
                required
                type='text' 
                style={{...inputStyle, width: '200px', height: '30px', marginLeft: '10px',marginTop: '1px'}}   
            />
            </label>

                <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between'}}>
                    <span>Username:</span>
                    <input
                        required
                        type='text' 
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        style={{...inputStyle, width: '200px', height: '30px', marginLeft: '10px',marginTop: '1px'}}   
                        />
                </label>
                <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between'}}>
                    <span>Year:</span>
                    <input
                        required
                        type='number'
                        onChange={(e) => setYear(e.target.value)}
                        value={year}
                        readOnly
                        style={{...inputStyle, width: '200px', height: '30px', marginLeft: '10px',marginTop: '1px'}}   
                    />
                </label>
                <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between'}}>
                    <span>Batch:</span>
                    <input
                        required
                        type='text'
                        onChange={(e) => setBatch(e.target.value)}
                        value={batch}
                        readOnly
                        style={{...inputStyle, width: '200px', height: '30px', marginLeft: '10px',marginTop: '1px'}}   
                    />
                </label>
                <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between'}}>
                    <span>Change Password:</span>
                    <input
                        required
                        type='password'
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        style={{...inputStyle, width: '200px', height: '30px', marginLeft: '10px',marginTop: '1px'}}   
                    />
                </label>
                <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between'}}>
                    <span>About:</span>
                    <textarea
                        required
                        onChange={(e) => setAbout(e.target.value)}
                        value={About}
                        style={{...inputStyle, width: '200px', height: '200px', marginLeft: '10px',marginTop: '1px'}}   
                    />
                </label>
                <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between'}}>
                    <span>Topic of Interests:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {topics.map((topic, index) => (
                        <div key={index} style={{ padding: '1px', display: 'flex', alignItems: 'left' }}>
                            <input type="checkbox" id={topic} name={topic} value={topic} style={{ transform: 'scale(0.8)' }} />
                            <label htmlFor={topic} style={{ marginLeft: '1px' }}>{topic}</label>
                        </div>
                    ))}
                    </div>
                </label>
                <button
                    className='btn-primary'
                    disabled={isloading}
                    style={isloading ? disabledButtonStyle : buttonStyle}
                >
                    {isloading && <span>Updating...</span>}
                    {!isloading && <span>Update Profile</span>}
                </button>
            </form>
        </div>
    )
}
