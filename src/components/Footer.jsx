'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Footer = () => {
  const buttonRef = useRef(null)
  const circleRef = useRef(null)
  const textRef = useRef(null)
  const iconRef = useRef(null)
  const strokeRef = useRef(null)

  useEffect(() => {
    const btn = buttonRef.current
    const circle = circleRef.current
    const text = textRef.current
    const icon = iconRef.current
    const stroke = strokeRef.current

    const tl = gsap.timeline({ paused: true })

    // Animate black fill circle
    tl.to(circle, {
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    })

    // Animate stroke circle (draw border in circular way)
    tl.to(
      stroke,
      {
        strokeDashoffset: 0,
        duration: 0.6,
        ease: 'power2.out',
      },
      '<0.1'
    )

    // Animate text and icon to white
    tl.to(
      [text],
      {
        color: '#D9D9D9',
        duration: 0.3,
        ease: 'power2.out',
      },
      '<0.1'
    )

    tl.to(
      [icon],
      {
        filter: 'invert(1)',
        duration: 0.3,
        ease: 'power2.out',
      },
      '<'
    )

    btn.addEventListener('mouseenter', () => tl.play())
    btn.addEventListener('mouseleave', () => tl.reverse())

    return () => {
      btn.removeEventListener('mouseenter', () => tl.play())
      btn.removeEventListener('mouseleave', () => tl.reverse())
    }
  }, [])

  return (
    <div className='min-h-screen bg-[#D9D9D9] w-full'>
      <div className='lg:leading-[15vh] pt-20 flex flex-col items-center h-[100vh] text-center text-black'>
        <h1 className='font-title font-extrabold text-[8vw] pr-[30vw]'>LET’S START</h1>
        <h1 className='font-title2 text-[10vw] pl-[10vw]'>Something Great</h1>
        <h1 className='font-title font-extrabold text-[8vw] pl-[30vw]'>TOGETHER</h1>

        {/* BUTTON */}
        <div
          ref={buttonRef}
          className='relative mr-[45vw]  cursor-pointer rounded-full mt-4 w-[20vw] h-[20vw] flex justify-center items-center font-title group'
        >
          {/* Scaling Black Circle */}
          <div
            ref={circleRef}
            className='absolute  top-0 left-0 w-full h-full bg-black rounded-full scale-0 z-0 will-change-transform'
            style={{ transformOrigin: 'center center' }}
          ></div>

          {/* SVG Circular Border */}
          <svg
            className='absolute top-0 left-0 z-10'
            width='100%'
            height='100%'
            viewBox='0 0 200 200'
          >
            <circle
              ref={strokeRef}
              cx='100'
              cy='100'
              r='95'
              fill='none'
              stroke='black'
              strokeWidth='2'
              strokeDasharray={Math.PI * 2 * 95}
              strokeDashoffset={Math.PI * 2 * 95}
            />
          </svg>

          {/* Content */}
          <div className='flex border justify-center items-center h-[19.5vw] w-[19.5vw] overflow-hidden hover:border-[#D9D9D9]  rounded-full flex-col '>
            
            <div className='flex z-99 justify-center items-center relative'>
                <img
              ref={iconRef}
              src='contacticon.png'
              alt='icon'
              className='mr-4 w-[2vw] h-[2vw]'
            />
            <h3
              ref={textRef}
              className='font-title text-black text-[1.2vw] transition-colors'
            >
              open contact form
            </h3>
                </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
