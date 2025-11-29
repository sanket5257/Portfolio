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
      gsap.set(headingsRef.current, { 
        x: (i) => (i % 2 === 0 ? -150 : 150),
        opacity: 0,
        willChange: 'transform, opacity',
      })

      headingsRef.current.forEach((el) => {
        if (!el) return

        gsap.to(el, {
          x: 0,
          opacity: 1,
          duration: 2,
          ease: "power1.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 10%",
            scrub: 6,
            markers: false,
          },
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div id='about' className='bg-[#D9D9D9] pt-[10vw] w-full'>

      <div
        id='heading'
        className='pt-8 md:pt-12 lg:pt-16 xl:pt-20 flex flex-col items-center 
        min-h-[80vh] md:min-h-[90vh] lg:min-h-[100vh]
        justify-center text-center text-black 
        px-4 sm:px-6 md:px-8'
      >
        
        {/* 1 */}
        <h1
          ref={(el) => (headingsRef.current[0] = el)}
          className='font-title font-extrabold leading-tight lg:leading-[0.9]
          text-5xl sm:text-6xl md:text-7xl 
          lg:text-8xl xl:text-9xl mb-3 sm:mb-4 md:mb-6 
          lg:pr-[15vw] xl:pr-[25vw] 2xl:pr-[30vw]'
        >
          WEBSITES
        </h1>

        {/* 2 */}
        <h1
          ref={(el) => (headingsRef.current[1] = el)}
          className='font-title2 leading-tight lg:leading-[0.9]
          text-6xl sm:text-7xl md:text-8xl 
          lg:text-9xl xl:text-[10rem] mb-3 sm:mb-4 md:mb-6 
          lg:pl-[10vw] xl:pl-[15vw] 2xl:pl-[20vw]'
        >
          That Work
        </h1>

        {/* 3 */}
        <h1
          ref={(el) => (headingsRef.current[2] = el)}
          className='font-title font-extrabold leading-tight lg:leading-[0.9]
          text-5xl sm:text-6xl md:text-7xl 
          lg:text-8xl xl:text-9xl mb-3 sm:mb-4 md:mb-6 
          lg:pr-[15vw] xl:pr-[25vw] 2xl:pr-[30vw]'
        >
          HARDER
        </h1>

        {/* 4 */}
        <h1
          ref={(el) => (headingsRef.current[3] = el)}
          className='font-title font-extrabold leading-tight lg:leading-[0.9]
          text-5xl sm:text-6xl md:text-7xl 
          lg:text-8xl xl:text-9xl mb-3 sm:mb-4 md:mb-6 
          lg:pl-[10vw] xl:pl-[15vw] 2xl:pl-[20vw]'
        >
          THAN YOUR
        </h1>

        {/* 5 */}
        <h1
          ref={(el) => (headingsRef.current[4] = el)}
          className='font-title2 leading-tight lg:leading-[0.9]
          text-6xl sm:text-7xl md:text-8xl 
          lg:text-9xl xl:text-[10rem]'
        >
          Competition
        </h1>

      </div>

      <AboutMiddle />
      <AboutBottom />
      <AboutContact />
    </div>
  )
}

export default About
