import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react"
import Image from 'next/image';

export default function userForum() {
    
    const [open, setOpen] = useState(false)
    const node = useRef();
    const router = useRouter();
    const [name, setName] = useState('')
    const handleClickOutside = e => {
        if (node.current.contains(e.target)) {
            // inside click
            return;
        }
        // outside click 
        setOpen(false);
    };

    useEffect(() =>{
        setName(router.query.data)
    }, [router.query]);

    useEffect(() => {
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return(
        <>
        <div className="flex bg-white w-full items-center ml-[40px]">
            <div className="flex hover:bg-gray-300 rounded-full items-center mt-[10px]">
                <img src="/assets/more.png" className="h-[45px] w-[45px] p-3" onClick={()=>{setOpen(!open)}}/>
            </div>
            <img src="/assets/logo.png" width={200}/>
        </div>
        <div ref={node} className={`flex flex-col fixed top-0 left-0 z-40 w-64 h-screen justify-start bg-white shadow-lg transition-transform ease-in-out duration-500 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
           <img src={`/assets/forums/${name}.jpg`} className="w-[150px] h-[150px] mt-[20px] self-center"/>
            <hr class="h-px my-8 bg-black border-1 dark:bg-white" />
            <p>Hwllo</p>
       
            
        </div>
        
        </>
    )
}
