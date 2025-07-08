'use client'
import React, { useRef, useEffect } from 'react'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react'

import About from './About';
import Work from './Work';
import Navbar from '@/components/Navbar';
import { ScrollTrigger } from 'gsap/all';
import Footer from '@/components/Footer';

// RollingText (used for side and footer text)
const RollingText = ({ text, className = '' }) => {
  const containerRef = useRef(null);
gsap.registerPlugin(ScrollTrigger)
  const roll = () => {
    const spans = containerRef.current.querySelectorAll('.rolling-char');
    spans.forEach((span, i) => {
      gsap.to(span, {
        rotationY: 360,
        duration: 0.6,
        ease: "power2.inOut",
        delay: i * 0.05,
                
        onComplete: () => {
          gsap.set(span, { rotationY: 0 });
        }
      });
    });
  };

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={roll}
    >
      {text.split('').map((char, i) => (
        <span className="rolling-char" key={i}>{char}</span>
      ))}
    </span>
  );
};

// MainRollingText (used for "sanket" and "chougule" with load animation)
const MainRollingText = ({ text, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const spans = containerRef.current.querySelectorAll('.main-char');
    const tl = gsap.timeline();
    tl.fromTo(
      spans,
      { y: 80, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power4.out",
        stagger: 0.07,
      }
    );
  }, []);

  return (
    <span ref={containerRef} className={className}>
      {text.split('').map((char, i) => (
        <span className="main-char inline-block" key={i}>{char}</span>
      ))}
    </span>
  );
};

const Page = () => {
//   gsap.registerPlugin(ScrollTrigger);
 
// useGSAP(() => {
//     gsap.set("#video-frame", {
//       clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
//       borderRadius: "0% 0% 40% 10%",
//     });
//     gsap.from("#video-frame", {
//       clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
//       borderRadius: "0% 0% 0% 0%",
//       ease: "power1.inOut",
//       scrollTrigger: {
//         trigger: "#video-frame",
//         start: "center center",
//         end: "bottom center",
//         scrub: true,
//       },
//     });
//   });
  
  return (
    <>
    <Navbar/>
      <div id='video-frame' className='h-screen  bg-black text-[#D9D9D9] relative'>
          <video 
          playsInline
          autoPlay
          loop
          muted
          className="pointer-events-none  h-full md:h-auto w-full  object-cover"
          src="/herobgvid.webm"
        ></video>
        
        <div id='hero-center' className='h-[80vh] 
 mask-clip-path lg:px-16 flex justify-between  items-center w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center'>
          <div id='left-text'>
            <h3 className='font-title hidden md:block cursor-pointer'>
              <RollingText text="LINKEDIN" />
            </h3>
          </div>
          <div className="text-center">
            <h1 className="font-title uppercase font-extrabold text-[15vw] lg:leading-[20vh] leading-15 sm:text-[8vw] lg:text-[12vw]">
              <MainRollingText text="sanket," />
            </h1>
            <h1 className="font-title2 text-[9vw] pl-[10vw] sm:pl-[20vw] lg:pl-[30vw] sm:text-[4vw] lg:text-[5vw]">
              <MainRollingText text="Chougule" />
            </h1>
          </div>
          <div>
            <h3 className='font-title hidden md:block cursor-pointer'>
              <RollingText text="INSTAGRAM" />
            </h3>
          </div>
        </div>
        <div id='hero-end' className='absolute font-title flex justify-start items-center flex-col bottom-0 h-[15vh] w-full'>
          <h3 className="cursor-pointer text-[4vw] sm:text-[2vw] md:text-[1.5vw]">
            <RollingText text="WEBDESIGNER" />
          </h3>
          <h3 className="cursor-pointer text-[4vw] sm:text-[2vw] md:text-[1.5vw]">
            <RollingText text="& DEVELOPER" />
          </h3>
        </div>
      </div>
      <style>{`
        .rolling-char {
          display: inline-block;
          will-change: transform;
          transition: color 0.2s;
        }
        .main-char {
          display: inline-block;
          will-change: transform;
        }
      `}</style>

        <About />
        <Work/>

          <Footer/>
    </>
  );
};

export default Page;
