'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Work = () => {
  const circleRef = useRef(null)
  const sectionRef = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)

  useEffect(() => {
    const circle = circleRef.current
    const section = sectionRef.current

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const handleMouseEnter = () => {
      isHovering.current = true
      gsap.to(circle, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      isHovering.current = false
      gsap.to(circle, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.inOut',
      })
    }

    const update = () => {
      if (isHovering.current && section) {
        const rect = section.getBoundingClientRect()
        const x = mouse.current.x - rect.left - 50
        const y = mouse.current.y - rect.top - 50

        gsap.to(circle, {
          x,
          y,
          duration: 0.2,
          ease: 'power3.out',
        })
      }
      requestAnimationFrame(update)
    }

    section.addEventListener('mousemove', handleMouseMove)
    section.addEventListener('mouseenter', handleMouseEnter)
    section.addEventListener('mouseleave', handleMouseLeave)

    requestAnimationFrame(update)

    // ScrollTrigger animations
    const images = section.querySelectorAll('.project-image')
    images.forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1 },
        {
          scale: 1.1,
          scrollTrigger: {
            trigger: img,
            start: 'top 80%',
            end: 'bottom top',
            scrub: true,
          },
          ease: 'power2.out',
        }
      )
    })

    return () => {
      section.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseenter', handleMouseEnter)
      section.removeEventListener('mouseleave', handleMouseLeave)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div id='work' className="min-h-screen bg-[#D9D9D9] w-full">
      {/* Heading */}
      <div className="leading-[14vw] sm:leading-[10vw] pt-20 pb-20 w-full flex flex-col items-center">
        <h1 className="font-title2 text-[14vw] sm:text-[10vw] pr-0 sm:pr-[10vw]">Selected</h1>
        <h1 className="font-title font-extrabold text-[14vw] sm:text-[10vw] pl-0 sm:pl-[10vw]">Work</h1>
      </div>

      {/* Projects */}
      <div
        id="projects"
        ref={sectionRef}
        className="relative overflow-hidden cursor-none"
      >
        {/* Project 1 */}
        <div className="relative">
          <img src="project1.png" className="md:h-full h-screen md:w-full project-image object-cover" alt="project 1" />
          <div className="absolute top-0 left-0 w-full h-full bg-black/10 flex flex-col justify-center items-center text-[#D9D9D9] leading-[15vw] sm:leading-[9.5vw]">
            <h1 className="font-title font-extrabold uppercase text-[14vw] sm:text-[10vw]">My</h1>
            <h1 className="font-title2 text-[14vw] sm:text-[10vw]">Portfolio</h1>
          </div>
        </div>

        {/* Project 2 */}
        <div className="relative">
          <img src="project2.png" className="md:h-full h-screen md:w-full project-image object-cover" alt="project 2" />
          <div className="absolute top-0 left-0 w-full h-full bg-black/10 flex flex-col justify-center items-center text-[#D9D9D9] leading-[15vw] sm:leading-[9.5vw]">
            <h1 className="font-title font-extrabold uppercase text-[14vw] sm:text-[10vw]">Zentry</h1>
            <h1 className="font-title2 text-[14vw] sm:text-[10vw]">Clone</h1>
          </div>
        </div>

        {/* Custom Cursor */}
        <div
          ref={circleRef}
          className="pointer-events-none opacity-0 scale-90 absolute top-0 left-0 w-[70px] sm:w-[100px] h-[70px] sm:h-[100px] rounded-full backdrop-blur-md bg-white/10 border border-white/30 flex items-center justify-center text-white font-title text-[2vw] sm:text-sm z-50 will-change-transform"
        >
          VIEW
        </div>
      </div>
    </div>
  )
}

export default Work
