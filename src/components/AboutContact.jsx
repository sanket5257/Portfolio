'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const AboutContact = () => {
  const containerRef = useRef(null)
  const fillRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal on scroll
      gsap.utils.toArray('.contact-reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          }
        })
      })

      // Fill animation on hover
      const fill = fillRef.current
      const button = buttonRef.current

      const handleEnter = () => {
        gsap.to(fill, {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 0.4,
          ease: 'power2.out'
        })
      }

      const handleLeave = () => {
        gsap.to(fill, {
          scaleX: 0,
          transformOrigin: 'right center',
          duration: 0.4,
          ease: 'power2.in'
        })
      }

      button.addEventListener('mouseenter', handleEnter)
      button.addEventListener('mouseleave', handleLeave)

      // Cleanup
      return () => {
        button.removeEventListener('mouseenter', handleEnter)
        button.removeEventListener('mouseleave', handleLeave)
      }

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className='w-full lg:px-32 bg-[#D9D9D9] overflow-x-hidden pb-20'
    >
      <div>
        <h1 className='font-title2 text-[5vw] contact-reveal'>Still Have Some</h1>
        <h1 className='font-title font-extrabold text-[4.5vw] contact-reveal'>QUESTIONS ABOUT ME</h1>
      </div>

      <a
        ref={buttonRef}
        className='hover-button relative overflow-hidden contact-reveal cursor-pointer float-right border-2 border-black hover:border-white rounded-lg p-4 mt-4 w-[38vw] h-[13vw] flex justify-center items-center body-font'
      >
        {/* Expanding white fill */}
        <div
          ref={fillRef}
          className='absolute left-0 top-0 w-full h-full bg-white  scale-x-0 z-0'
          style={{
            transformOrigin: 'left center',
          }}
        />

        {/* Button text */}
        <div className='relative z-10 flex justify-center items-center'>
                    <img src="contacticon.png" className='p-4' alt="" />
        <h3 className='relative font-title z-10'>open contact form</h3>

        </div>
      </a>
    </div>
  )
}

export default AboutContact
