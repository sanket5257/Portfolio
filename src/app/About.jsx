'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AboutMiddle from '@/components/AboutMiddle'
import AboutBottom from '@/components/AboutBottom'
import AboutContact from '@/components/AboutContact'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
  const headingsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
  trigger: "#heading",
   start: "top 80%",
  end: "bottom top",
  
  scrub: 1,
}

      });

      headingsRef.current.forEach((el, idx) => {
        if (!el) return;
        tl.to(
          el,
          {
            x: idx % 2 === 0 ? 50 : -50, // small subtle movement
            ease: "power2.out"
          },
          0 // <– make all animations start at same time
        );
      });
    });

    return () => ctx.revert(); // cleanup on unmount
  }, []);

  return (
    <div id='about' className=' bg-[#D9D9D9] pt-[10vw] w-full'>
      <div id='heading' className=' lg:pt-20 flex flex-col  items-center lg:h-[100vh] text-center text-black'>
        <h1 ref={el => (headingsRef.current[0] = el)} className='font-title font-extrabold text-[8vw] pr-[30vw]'>WEBSITES</h1>
        <h1 ref={el => (headingsRef.current[1] = el)} className='font-title2 text-[10vw] pl-[10vw] lg:leading-20'>That Work</h1>
        <h1 ref={el => (headingsRef.current[2] = el)} className='font-title font-extrabold text-[8vw] pl-[30vw] lg:leading-20'>HARDER</h1>
        <h1 ref={el => (headingsRef.current[3] = el)} className='font-title font-extrabold text-[8vw] lg:leading-30'>THAN YOUR</h1>
        <h1 ref={el => (headingsRef.current[4] = el)} className='font-title2 text-[10vw] pl-[30vw] lg:leading-35'>Competition</h1>
      </div>
      <AboutMiddle/>
      <AboutBottom/>
      <AboutContact/>
    </div>
  )
}

export default About
