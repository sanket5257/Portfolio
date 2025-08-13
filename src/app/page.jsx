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

<div className='absolute font-title text-sm bottom-5 z-50 px-16 text-white space-y-1 pointer-events-auto'>
  <h3>
    <a 
      href="mailto:chougulesanket30@gmail.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="hover:underline cursor-pointer"
    >
      Email
    </a>
  </h3>
  <h3>
    <a 
      href="https://www.linkedin.com/in/sanket-chougule5257" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="hover:underline cursor-pointer"
    >
      LinkedIn
    </a>
  </h3>
  <h3>
    <a 
      href="https://github.com/sanket5257" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="hover:underline cursor-pointer"
    >
      GitHub
    </a>
  </h3>
  <h3>
    <a 
      href="https://www.instagram.com/yourusername" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="hover:underline cursor-pointer"
    >
      Instagram
    </a>
  </h3>
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
