import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react"
import Image from 'next/image';

export default function userForum() {
    
    const [open, setOpen] = useState(false)
    const node = useRef();
    const router = useRouter();
    const [det, setdet] = useState('')
    const [name, setName] = useState('')
    const [furl, setfurl] = useState('')
    const [side, setSide] = useState('Home')
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
        getData()
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

    async function getData(){
        const data = require(`../../public/forumDetails/${router.query.data}/details.json`);
        setdet(data.details);    
        setfurl(data.url);
    }

    return(
        <>
        <div className="flex bg-white w-full items-center ml-[40px]">
            <div className="flex hover:bg-gray-300 rounded-full items-center mt-[10px]">
                <img src="/assets/more.png" className="h-[45px] w-[45px] p-3" onClick={()=>{setOpen(!open)}}/>
            </div>
            <img src="/assets/logo.png" width={200}/>
        </div>
        <div ref={node} className={`flex flex-col fixed top-0 left-0 z-40 w-64 h-screen justify-start bg-white shadow-lg transition-transform ease-in-out duration-500 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
           <img src={`/assets/forums/${name}.jpg`} className="w-[150px] h-[150px] mt-[20px] self-center rounded-2xl"/>
           <p className="font-product-sans font-semibold self-center text-xl mt-[20px]">{name}</p>
            <hr className="h-px mt-[20px] bg-black border-1 dark:bg-white" />
            <div className="flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={()=>{setSide('Home')}}>
                <img src="/assets/home.svg" className="ml-[30px]" width={20}/>
                <p className="font-sans text-md">Home</p>
            </div>
            <div className="flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 rounded-lg" onClick={()=>{setSide('Events')}}>
                <img src="/assets/home.svg" className="ml-[30px]" width={20}/>
                <p className="font-sans text-md">Events</p>
            </div>
       
            
        </div>
        {
            side === "Home" &&  <section className="relative">
            {/* Illustration behind hero content */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none" aria-hidden="true">
              <svg width="1360" height="578" viewBox="0 0 1360 578" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="illustration-01">
                    <stop stopColor="#FFF" offset="0%" />
                    <stop stopColor="#EAEAEA" offset="77.402%" />
                    <stop stopColor="#DFDFDF" offset="100%" />
                  </linearGradient>
                </defs>
                <g fill="url(#illustration-01)" fillRule="evenodd">
                  <circle cx="1232" cy="128" r="128" />
                  <circle cx="155" cy="443" r="64" />
                </g>
              </svg>
            </div>
      
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              {/* Hero content */}
              <div className="pt-32 pb-12 md:pt-40 md:pb-20">
                {/* Section header */}
                <div className="text-center pb-12 md:pb-16 space-y-8">
                  <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">
                    {name} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">CEC</span>
                  </h1>
                  <div className="mx-auto max-w-3xl">
                    <p className="text-xl text-gray-600 mb-8 text-justify" data-aos="zoom-y-out" data-aos-delay="150">
                     {det}
                    </p>
                    <div className="mx-auto max-w-sm space-x-5 flex justify-center flex-row" data-aos="zoom-y-out" data-aos-delay="300">
                      <div>
                        <a className="btn text-white bg-blue-600 hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0" onClick={()=>{setSide("Events")}}>
                            View Events
                        </a>
                      </div>
                      <div>
                       
                        <a className="btn items-center space-x-3 text-white bg-gray-900 hover:bg-gray-800 w-full sm:w-auto sm:ml-4" onClick={()=>{router.push(furl)}}>
                        <img src="/assets/web.png" width={20} />
                          <p>Website</p>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
      
                {/* Hero image */}
                <div>
                  <div className="relative flex justify-center mb-8" data-aos="zoom-y-out" data-aos-delay="450">
                    <div className="flex flex-col justify-center">
                      <img className="mx-auto" src={`/assets/forums/${name}.jpg`} width="768" height="432" alt="Hero" />
                      <svg
                        className="absolute inset-0 max-w-full mx-auto md:max-w-none h-auto"
                        width="768"
                        height="432"
                        viewBox="0 0 768 432"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                      >
                        <defs>
                          <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="hero-ill-a">
                            <stop stopColor="#FFF" offset="0%" />
                            <stop stopColor="#EAEAEA" offset="77.402%" />
                            <stop stopColor="#DFDFDF" offset="100%" />
                          </linearGradient>
                          <linearGradient x1="50%" y1="0%" x2="50%" y2="99.24%" id="hero-ill-b">
                            <stop stopColor="#FFF" offset="0%" />
                            <stop stopColor="#EAEAEA" offset="48.57%" />
                            <stop stopColor="#DFDFDF" stopOpacity="0" offset="100%" />
                          </linearGradient>
                        </defs>
                        <g fill="none" fillRule="evenodd">
                          <g fillRule="nonzero">
                            <use fill="#000" xlinkHref="#hero-ill-d" />
                            <use fill="url(#hero-ill-e)" xlinkHref="#hero-ill-d" />
                          </g>
                        </g>
                      </svg>
                    </div>
                    <button
                      className="absolute top-full flex items-center transform -translate-y-1/2 bg-white rounded-full font-medium group p-4 shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setVideoModalOpen(true);
                      }}
                      aria-controls="modal"
                    >
                      <svg
                        className="w-6 h-6 fill-current text-gray-400 group-hover:text-blue-600 flex-shrink-0"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0 2C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12z" />
                        <path d="M10 17l6-5-6-5z" />
                      </svg>
                      <span className="ml-3">Watch the full video (2 min)</span>
                    </button>
                  </div>                 
                </div>
              </div>
            </div>
          </section>
        }
        {
            side === "Events" && <div>
              addEventLi
            </div>
        }
        
        </>
    )
}
