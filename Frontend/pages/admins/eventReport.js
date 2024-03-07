import { useState, useEffect } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
// import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Image from 'next/image';
import path from 'path';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic'

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    { ssr: false }
)

const EventReport = () => {
    const [events, setEventDetails] = useState([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const router = useRouter();
    const eventId = Cookies.get('eventId');

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

    const handleGenerateReport = async () => {
        const rawContentState = convertToRaw(editorState.getCurrentContent());
        const rawContent = JSON.stringify(rawContentState);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generateHtmlPdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ richTextContent: rawContent }),
        });
        const data = await response.json();
        const pdf = data.pdf;
        if (typeof window !== 'undefined') {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${pdf}`;
            link.download = 'report.pdf';
            link.click();
        }
    };
    return (
        <>
            <div className="shadow-lg">
                <div className="flex bg-white w-full justify-between items-center">
                    <img src="/assets/logo.png" width={160} onClick={handleback} className='cursor-pointer' />
                </div>
            </div>
            <div className="w-full flex flex-col items-center mt-10">
                <h1 className="text-2xl font-bold mb-4">Report Your Event Details here</h1>
                <div className="w-1/2 p-4 border rounded mb-4 bg-gray-300">
                    <h2 className="text-lg font-bold mb-2">Event Summary</h2>
                    <Editor
                        editorState={editorState}
                        toolbarClassName="toolbarClassName"
                        wrapperClassName="wrapperClassName"
                        editorClassName="editorClassName bg-white p-4 rounded-lg border-2 border-gray-400 mb-[1.5rem] mt-[1rem]"
                        onEditorStateChange={setEditorState}
                        toolbar={{
                            options: ['inline', 'list'],
                            inline: {
                                options: ['bold', 'italic', 'underline']
                            },
                            list: {
                                options: ['unordered', 'ordered']
                            }
                        }}
                    />
                    <button onClick={handleGenerateReport} className="p-2.5 bg-blue-500 rounded-xl text-white">Print PDF</button>
                </div>
            </div>
        </>
    )
}
export default EventReport;