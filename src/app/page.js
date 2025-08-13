'use client'

import React, { useRef, useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import About from './About'
import Work from './Work'
import Footer from '@/components/Footer'

const RollingText = ({ text, className = '' }) => <span className={className}>{text}</span>

const Page = () => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Start music muted and autoplay on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = true // Start muted to allow autoplay
      audioRef.current.play().catch(err => {
        console.log('Autoplay blocked until user interacts:', err)
      })
    }
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.muted = false
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-screen pointer-events-none">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/hero-bg.mp4"
        />

        {/* Background Music */}
        <audio ref={audioRef} src="/track.mp3" loop />

        {/* Music Control Floating Button */}
       <button
  onClick={toggleMusic}
  className="absolute bottom-5 right-5 z-50 bg-black/50 rounded-full p-3 pointer-events-auto"
>
  {isPlaying ? (
    // Animated Wave Bars
    <svg
      className="w-8 h-8 text-white"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <rect className="wave-bar bar1" x="4" y="4" width="3" height="16" rx="1" />
      <rect className="wave-bar bar2" x="10.5" y="4" width="3" height="16" rx="1" />
      <rect className="wave-bar bar3" x="17" y="4" width="3" height="16" rx="1" />
    </svg>
  ) : (
    // Play Icon
    <svg
      className="w-8 h-8 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )}
</button>

<style >{`
  .wave-bar {
    transform-origin: center;
    animation: waveAnim 1s ease-in-out infinite;
  }
  .bar1 {
    animation-delay: 0s;
  }
  .bar2 {
    animation-delay: 0.2s;
  }
  .bar3 {
    animation-delay: 0.4s;
  }
  @keyframes waveAnim {
    0%, 100% {
      transform: scaleY(0.4);
    }
    50% {
      transform: scaleY(1);
    }
  }
`}</style>



        <div className="absolute inset-0 z-10 text-[#D9D9D9] flex flex-col justify-between items-center px-4 sm:px-10 py-8">
         
          
          
        </div>
      </div>

      <About />
      <Work />
      <Footer />

      {/* Slow Spin Animation */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
      `}</style>
    </>
  )
}

export default Page
