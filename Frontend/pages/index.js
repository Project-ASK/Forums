import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

const Test = () => {
  const [images, setImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/images`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setImages(data))
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        setError(error.message);
      });


    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const localImages = [
    { name: 'IEEE.JPG', link: 'https://cecieee.org/' },
    { name: 'IEDC.JPG', link: 'https://www.iedcbootcampcec.in/' },
    { name: 'GDSC.jpg', link: 'https://gdsc.community.dev/college-of-engineering-chengannur/' },
    { name: 'TINKERHUB.JPG', link: 'https://tinkerhub-cec-website.vercel.app/' },
    { name: 'MULEARN.jpg', link: 'https://mulearn.org/' },
    { name: 'FOCES.jpg', link: 'http://foces.org/' },
    { name: 'NSS.jpg', link: 'https://ceconline.edu/organizations/nss/' },
    { name: 'NCC.jpg', link: 'https://ceconline.edu/organizations/ncc_unit/' },
    { name: 'PRODDEC.jpg', link: 'https://cec-proddec.web.app/' }
  ]

  const handleImageClick = (url) => {
    window.open(url, '_blank');
  }

  const Login = () => {
    window.location.href = '/login';
  }

  return (
    <>
      <div className='pb-16' style={{ backgroundImage: 'url("/assets/back.jpg")', backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="flex min-h-screen items-center justify-center lg:justify-center" >
          <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-4 rounded-2xl shadow-md w-full absolute top-2 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-left ml-8">Forum Management</h1>
            {!isMobile && <button className="mr-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded" onClick={Login}>Login</button>}
          </div>
          {isMobile &&
            <div className="absolute top-[2.5%] right-2 flex items-center">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={Login}>Login</button>
            </div>
          }
          <div className="relative top-8">
            <div>
              <h2 className="text-2xl font-semibold text-center mb-4 relative top-6">Achievements</h2>
              <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
                {error ? (
                  <div className="w-11/12 md:w-1/2 lg:w-[70%] mx-auto relative top-6">
                    <img src="/assets/error.png" alt="Error" className="w-full h-64 md:h-96 lg:h-128 object-cover rounded-lg" style={{ objectFit: 'contain' }} />
                  </div>
                ) : (
                  images.map((image, index) => (
                    <div key={index} className="w-11/12 md:w-1/2 lg:w-[70%] mx-auto relative top-6">
                      <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/guest/${image}`} alt="image" className="w-full h-64 md:h-96 lg:h-128 object-cover rounded-lg" style={{ objectFit: 'contain', borderRadius: '25px' }} />
                    </div>
                  ))
                )}
              </Carousel>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-center relative top-8">Forums</h2>
              <div className='flex justify-center relative top-6'>
                <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg p-3 rounded-2xl shadow-md w-[85%] sm:w-[75%] md:w-[50%] mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {localImages.slice(0, 9).map((image, index) => (
                    <div key={index} className="w-full flex justify-center">
                      <img src={`/assets/forums/${image.name}`} alt="image" className="w-[50%] sm:w-[30%] h-auto object-cover rounded-lg cursor-pointer" onClick={() => handleImageClick(image.link)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bottom-2 left-4 fixed">
          <div className="p-2 rounded-2xl shadow-md mx-4 sm:mx-auto sm:w-full sm:max-w-md lg:mx-0 lg:w-full">
            <p className="text-md text-center">© 2024 My Website. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Test;
