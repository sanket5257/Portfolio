'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const AboutMiddle = () => {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
          // markers: true, // enable for debugging
        }
      })

      tl.to(imgRef.current, { y: 100, ease: 'none' }, 0)
      tl.to(textRef.current, { y: -100, ease: 'none' }, 0)
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="min-h-[120vh] bg-[#D9D9D9] w-full lg:px-32 py-32">
      <div className="flex flex-col lg:flex-row gap-16 items-end">
        <div ref={imgRef} className="">
          <img src="/myimg.png" alt="about-img" className="w-full h-auto" />
        </div>
        <div ref={textRef} className="w-full lg:w-[30vw]">
          <h3 className="font-bold font-title pb-5 text-[#1D1D1D] text-[1.2vw]">
            Designed to impress. Built to convert.
          </h3>
          <p className="text-[#666666] leading-relaxed font-title">
            I specialize in web design and development for clients who care about details. 
            Building upon my experiences in digital design across various industry sectors and 
            numerous projects, my goal is to create high-end web experiences that make your brand 
            go from a 'meh' to a 'woah'.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AboutMiddle
