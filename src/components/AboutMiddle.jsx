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
        },
      })

      tl.to(imgRef.current, { y: 100, ease: 'none' }, 0)
      tl.to(textRef.current, { y: -100, ease: 'none' }, 0)
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <style jsx>{`
        .liquid-glass-container:hover .liquid-glass-img {
          transform: scale(1.05) rotateX(2deg) rotateY(2deg);
          filter: blur(0.5px) brightness(1.1) contrast(1.1) saturate(1.2);
        }
        
        .liquid-glass-container:hover .liquid-glass-overlay {
          opacity: 1;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 75%,
            rgba(255, 255, 255, 0.1) 100%
          );
          backdrop-filter: blur(2px);
          animation: liquidWave 2s ease-in-out infinite;
        }
        
        @keyframes liquidWave {
          0%, 100% {
            transform: translateX(-100%) skewX(-15deg);
          }
          50% {
            transform: translateX(100%) skewX(15deg);
          }
        }
        
        .liquid-glass-container {
          perspective: 1000px;
        }
        
        .liquid-glass-img {
          transform-style: preserve-3d;
          will-change: transform, filter;
        }
        
        .liquid-glass-container:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    <section
      ref={containerRef}
      className="min-h-screen pb-[20vh] bg-[#D9D9D9] w-full px-6 sm:px-10 lg:px-32 py-24"
    >

      <div className="flex flex-col-reverse lg:flex-row items-end gap-12 lg:gap-16">
        {/* Text Section */}
        <div ref={imgRef} className="w-full lg:w-[25vw]">
         
          <div className="liquid-glass-container relative overflow-hidden rounded-xl">
            <img
              src="/my-img.jpg"
              alt="Sanket Chougule"
              className="liquid-glass-img w-full h-[60vw] sm:h-[50vw] lg:h-[35vw] object-cover rounded-xl shadow-md transition-all duration-700 ease-out"
            />
            <div className="liquid-glass-overlay absolute inset-0 rounded-xl opacity-0 transition-opacity duration-700 ease-out pointer-events-none"></div>
          </div>
        </div>
        <div ref={textRef} className="w-full lg:w-[35vw] text-center lg:text-left">
          <h3 className="font-bold font-title hidden md:block text-[#1D1D1D] text-[6vw] sm:text-[4vw] lg:text-[1.2vw] pb-5">
            Designed to impress. Built to convert.
          </h3>
          <p className="text-[#666666] leading-relaxed font-title text-[4vw] sm:text-[2.5vw] lg:text-[1vw]">
            I specialize in web design and development for clients who care about details.
            Building upon my experiences in digital design across various industry sectors and
            numerous projects, my goal is to create high-end web experiences that make your brand
            go from a 'meh' to a 'woah'.
          </p>
        </div>

        {/* Image Section */}
        
      </div>
    </section>
    </>
  )
}

export default AboutMiddle
