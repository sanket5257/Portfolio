'use client'

import React, { useRef, useState, useEffect } from 'react'
import About from './About'
import Work from './Work'
import Footer from '@/components/Footer'


const Page = () => {

  // Start music muted and autoplay on mount
  

  

  return (
    <>
    

      {/* Hero Section */}
      <div className="relative bg-black w-full h-screen pointer-events-none">
        <video
          className="w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/herobgvid.webm"
        />

        
       


<div className='absolute font-title text-sm bottom-5 z-50 px-16 text-white space-y-1 pointer-events-auto'>
      <h1>भारतीय Designer बेहतर मानव अनुभव बनाने में शामिल । डिजाइन के माध्यम से</h1>

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

     
    </>
  )
}

export default Page
