import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react"
import Image from 'next/image';

export default function userForum() {
    
    const [open, setOpen] = useState(false)
    const node = useRef();
    const router = useRouter();
    const [name, setName] = useState('')
    const [side, setSide] = useState('')
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
           <img src={`/assets/forums/${name}.jpg`} className="w-[150px] h-[150px] mt-[20px] self-center rounded-2xl"/>
           <p className="font-product-sans font-semibold self-center text-xl mt-[20px]">{name}</p>
            <hr class="h-px mt-[20px] bg-black border-1 dark:bg-white" />
            <div className="flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 mt-[30px] rounded-lg" onClick={()=>{setSide('Home')}}>
                <img src="/assets/home.svg" className="ml-[30px]" width={20}/>
                <p className="font-sans text-md">Home</p>
            </div>
            <div className="flex space-x-5 items-center p-3 hover:bg-gray-100 hover:transition-colors hover:ease-in-out hover:duration-500 rounded-lg">
                <img src="/assets/home.svg" className="ml-[30px]" width={20}/>
                <p className="font-sans text-md">Home</p>
            </div>
       
            
        </div>
        {
            side === "Home" && <div class="flex flex-col items-center justify-center px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:pt-32 md:px-0">
            <div class="flex flex-col items-center max-w-2xl md:px-8">
              <div class="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
                <div>
                  <p class="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
                    Brand new
                  </p>
                </div>
                <h2 class="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
                  <span class="relative inline-block">
                    <svg viewBox="0 0 52 24" fill="currentColor" class="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block">
                      <defs>
                        <pattern id="192913ce-1f29-4abd-b545-0fbccfd2b0ec" x="0" y="0" width=".135" height=".30">
                          <circle cx="1" cy="1" r=".7"></circle>
                        </pattern>
                      </defs>
                      <rect fill="url(#192913ce-1f29-4abd-b545-0fbccfd2b0ec)" width="52" height="24"></rect>
                    </svg>
                    <span class="relative">The</span>
                  </span>
                  quick, brown fox jumps over a lazy dog
                </h2>
                <p class="text-base text-gray-700 md:text-lg">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque rem aperiam, eaque ipsa quae.
                </p>
              </div>
              <form class="flex flex-col items-center w-full mb-4 md:flex-row">
                <input
                  placeholder="Name"
                  required=""
                  type="text"
                  class="flex-grow w-full h-12 px-4 mb-3 transition duration-200 bg-white border border-gray-300 rounded shadow-sm appearance-none md:mr-2 md:mb-0 focus:border-deep-purple-accent-400 focus:outline-none focus:shadow-outline"
                />
                <input
                  placeholder="Email"
                  required=""
                  type="text"
                  class="flex-grow w-full h-12 px-4 mb-3 transition duration-200 bg-white border border-gray-300 rounded shadow-sm appearance-none md:mr-2 md:mb-0 focus:border-deep-purple-accent-400 focus:outline-none focus:shadow-outline"
                />
                <button
                  type="submit"
                  class="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md md:w-auto bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700 focus:shadow-outline focus:outline-none"
                >
                  Subscribe
                </button>
              </form>
              <p class="max-w-md mb-10 text-xs text-gray-600 sm:text-sm md:text-center">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
              </p>
            </div>
            <img src="https://kitwind.io/assets/kometa/half-browser.png" class="w-full max-w-screen-sm mx-auto rounded shadow-2xl md:w-auto lg:max-w-screen-md" alt="" />
          </div>
        }
        
        </>
    )
}
