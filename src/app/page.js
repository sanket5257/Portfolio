'use client'
import React, { useRef } from 'react'
import dynamic from 'next/dynamic'

import About from './About'
import Work from './Work'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Load Spline without SSR
const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false })

// RollingText (used for side and footer text)
const RollingText = ({ text, className = '' }) => {
  const containerRef = useRef(null)

  const roll = () => {
    // GSAP animation disabled
  }

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
  )
}

// MainRollingText (used for "sanket" and "chougule" with load animation)
const MainRollingText = ({ text, className = '' }) => {
  const containerRef = useRef(null)

  // GSAP load animation disabled
  return (
    <span ref={containerRef} className={className}>
      {text.split('').map((char, i) => (
        <span className="main-char inline-block" key={i}>{char}</span>
      ))}
    </span>
  )
}

const Page = () => {
  return (
    <>
      <Navbar />

      {/* Interactive Spline background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/ymZFyEgESBR8OJCL/scene.splinecode" />
      </div>

      {/* Hero Section on top */}
      <div id="video-frame" className="relative z-10 pointer-events-none h-screen text-[#D9D9D9]">
        <div
          id="hero-center"
          className="h-[80vh] lg:px-16 flex justify-between items-center w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center"
        >
          <div id="left-text">
            <h3 className="font-title hidden md:block cursor-pointer">
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
            <h3 className="font-title hidden md:block cursor-pointer">
              <RollingText text="INSTAGRAM" />
            </h3>
          </div>
        </div>

        <div id="hero-end" className="absolute font-title flex justify-start items-center flex-col bottom-0 h-[15vh] w-full">
          <h3 className="cursor-pointer text-[4vw] sm:text-[2vw] md:text-[1vw]">
            <RollingText text="WEBDESIGNER" />
          </h3>
          <h3 className="cursor-pointer text-[4vw] sm:text-[2vw] md:text-[1vw]">
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

      {/* Sections */}
      <About />
      <Work />
      <Footer />
    </>
  )
}

export default Page
