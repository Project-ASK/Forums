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
            <div className="flex hover:bg-gray-300 ease-in-out transition-colors duration-200 rounded-full items-center mt-[10px]">
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
            <div className="flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 rounded-lg" onClick={()=>{setSide('Analytics')}}>
                <img src="/assets/stats.svg" className="ml-[30px]" width={20}/>
                <p className="font-sans text-md">Analytics</p>
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
            side === "Analytics" && <>
            <div id="no-scroll" className="flex max-h-screen overflow-auto flex-row justify-between items-center">
              <div className="px-6 ml-[5rem]">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-3xl mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-5">
                        <img src={`/assets/forums/${name}.jpg`} className="w-[50px] h-[50px] mt-[20px] self-center rounded-2xl"/>
                        <p className="font-product-sans font-semibold self-center text-xl mt-[20px]">{name}</p>
                      </div>
                      <div className="flex items-center gap-x-2">
                        <button type="button" className="inline-flex items-center justify-center h-9 px-3 rounded-xl border hover:border-gray-400 text-gray-800 hover:text-gray-900 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-chat-fill" viewBox="0 0 16 16">
                            <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
                          </svg>
                        </button>
                        <button type="button" className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-sm font-semibold transition">
                          Open
                        </button>
                      </div>
                    </div>
          
                    <hr className="my-10" />
          
                    <div className="grid grid-cols-2 gap-x-20">
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Stats</h2>
          
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <div className="p-4 bg-green-100 rounded-xl">
                              <div className="font-bold text-xl text-gray-800 leading-none">Good day, <br />Kristin</div>
                              <div className="mt-5">
                                <button type="button" className="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white text-gray-800 hover:text-green-500 text-sm font-semibold transition">
                                  Start tracking
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-yellow-100 rounded-xl text-gray-800">
                            <div className="font-bold text-2xl leading-none">20</div>
                            <div className="mt-2">Tasks finished</div>
                          </div>
                          <div className="p-4 bg-yellow-100 rounded-xl text-gray-800">
                            <div className="font-bold text-2xl leading-none">5,5</div>
                            <div className="mt-2">Tracked hours</div>
                          </div>
                          <div className="col-span-2">
                            <div className="p-4 bg-purple-100 rounded-xl text-gray-800">
                              <div className="font-bold text-xl leading-none">Your daily plan</div>
                              <div className="mt-2">5 of 8 completed</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Upcoming Tasks</h2>
                        <div className="space-y-4">
                          <div className="p-4 bg-white border rounded-xl text-gray-800 space-y-2">
                            <div className="flex justify-between">
                              <div className="text-gray-400 text-xs">Number 10</div>
                              <div className="text-gray-400 text-xs">4h</div>
                            </div>
                            <a href="javascript:void(0)" className="font-bold hover:text-yellow-800 hover:underline">Blog and social posts</a>
                            <div className="text-sm text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="text-gray-800 inline align-middle mr-1" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                              </svg>Deadline is today
                            </div>
                          </div>
                          <div className="p-4 bg-white border rounded-xl text-gray-800 space-y-2">
                            <div className="flex justify-between">
                              <div className="text-gray-400 text-xs">Grace Aroma</div>
                              <div className="text-gray-400 text-xs">7d</div>
                            </div>
                            <a href="javascript:void(0)" className="font-bold hover:text-yellow-800 hover:underline">New campaign review</a>
                            <div className="text-sm text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="text-gray-800 inline align-middle mr-1" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                              </svg>New feedback
                            </div>
                          </div>
                          <div className="p-4 bg-white border rounded-xl text-gray-800 space-y-2">
                            <div className="flex justify-between">
                              <div className="text-gray-400 text-xs">Petz App</div>
                              <div className="text-gray-400 text-xs">2h</div>
                            </div>
                            <a href="javascript:void(0)" className="font-bold hover:text-yellow-800 hover:underline">Cross-platform and browser QA</a>
                          </div>
          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
              <p className="font-product-sans font-semibold self-start text-xl mt-[20px]">Members</p>
              <ul role="list" className="divide-y divide-gray-100 mr-[15rem]">
  <li className="flex justify-between gap-x-6 py-5">
    <div className="flex min-w-0 gap-x-4">
      <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
      <div className="min-w-0 flex-auto">
        <p className="text-sm font-semibold leading-6 text-gray-900">Leslie Alexander</p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">leslie.alexander@example.com</p>
      </div>
    </div>
    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
      <p className="text-sm leading-6 text-gray-900">Co-Founder / CEO</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">Last seen <time datetime="2023-01-23T13:23Z">3h ago</time></p>
    </div>
  </li>
  <li className="flex justify-between gap-x-6 py-5">
    <div className="flex min-w-0 gap-x-4">
      <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
      <div className="min-w-0 flex-auto">
        <p className="text-sm font-semibold leading-6 text-gray-900">Michael Foster</p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">michael.foster@example.com</p>
      </div>
    </div>
    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
      <p className="text-sm leading-6 text-gray-900">Co-Founder / CTO</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">Last seen <time datetime="2023-01-23T13:23Z">3h ago</time></p>
    </div>
  </li>
  <li className="flex justify-between gap-x-6 py-5">
    <div className="flex min-w-0 gap-x-4">
      <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
      <div className="min-w-0 flex-auto">
        <p className="text-sm font-semibold leading-6 text-gray-900">Dries Vincent</p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">dries.vincent@example.com</p>
      </div>
    </div>
    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
      <p className="text-sm leading-6 text-gray-900">Business Relations</p>
      <div className="mt-1 flex items-center gap-x-1.5">
        <div className="flex-none rounded-full bg-emerald-500/20 p-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
        </div>
        <p className="text-xs leading-5 text-gray-500">Online</p>
      </div>
    </div>
  </li>
  <li className="flex justify-between gap-x-6 py-5">
    <div className="flex min-w-0 gap-x-4">
      <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
      <div className="min-w-0 flex-auto">
        <p className="text-sm font-semibold leading-6 text-gray-900">Lindsay Walton</p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">lindsay.walton@example.com</p>
      </div>
    </div>
    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
      <p className="text-sm leading-6 text-gray-900">Front-end Developer</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">Last seen <time datetime="2023-01-23T13:23Z">3h ago</time></p>
    </div>
  </li>
  <li className="flex justify-between gap-x-6 py-5">
    <div className="flex min-w-0 gap-x-4">
      <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
      <div className="min-w-0 flex-auto">
        <p className="text-sm font-semibold leading-6 text-gray-900">Courtney Henry</p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">courtney.henry@example.com</p>
      </div>
    </div>
    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
      <p className="text-sm leading-6 text-gray-900">Designer</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">Last seen <time datetime="2023-01-23T13:23Z">3h ago</time></p>
    </div>
  </li>
  <li className="flex justify-between gap-x-6 py-5">
    <div className="flex min-w-0 gap-x-4">
      <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
      <div className="min-w-0 flex-auto">
        <p className="text-sm font-semibold leading-6 text-gray-900">Tom Cook</p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">tom.cook@example.com</p>
      </div>
    </div>
    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
      <p className="text-sm leading-6 text-gray-900">Director of Product</p>
      <div className="mt-1 flex items-center gap-x-1.5">
        <div className="flex-none rounded-full bg-emerald-500/20 p-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
        </div>
        <p className="text-xs leading-5 text-gray-500">Online</p>
      </div>
    </div>
  </li>
</ul>
</div>
            </div>
          </>
        }
        
        </>
    )
}
