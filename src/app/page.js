'use client'
import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import About from './About';

// RollingText (used for side and footer text)
const RollingText = ({ text, className = '' }) => {
  const containerRef = useRef(null);

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
  return (
    <>
      <div className='h-screen bg-[#1D1D1D] text-[#D9D9D9] relative'>
        <img className='h-[100vh] w-full object-cover' src="herobg.png" alt="" />
        <div id='hero-center' className='h-[80vh] lg:px-16 flex justify-between items-center w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center'>
          <div id='left-text'>
            <h3 className='font-body cursor-pointer'>
              <RollingText text="LINKEDIN" />
            </h3>
          </div>
          <div id='center-text'>
            <h1 className='text-[12vw] lg:leading-[15vh] font-title uppercase font-extrabold'>
              <MainRollingText text="sanket," />
            </h1>
            <h1 className='font-title2  text-[5vw] pl-[35vw]'>
              <MainRollingText text="Chougule" />
            </h1>
          </div>
          <div>
            <h3 className='font-body cursor-pointer'>
              <RollingText text="INSTAGRAM" />
            </h3>
          </div>
        </div>
        <div id='hero-end' className='absolute font-body flex justify-start items-center flex-col bottom-0 h-[15vh] w-full'>
          <h3 className='cursor-pointer' >
            <RollingText text="WEBDESIGNER" />
          </h3>
          <h3 className='cursor-pointer'>
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


    </>
  );
};

export default Page;
