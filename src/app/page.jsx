'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import About from './About'
import Work from './Work'
import Footer from '@/components/Footer'
import Home from './Hero'
import Model from './Model'
import Skills from '../components/Skills'
import ScrollNavigation from '../components/ScrollNavigation'

// Dynamically import the Loader component with no SSR

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);

    // Cleanup function
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  

  // Prevent scrolling when loading

  if (!mounted) {
    return null; // Or a simple loading state
  }

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-xl font-semibold">
        Please view on desktop
      </div>
    );
  }


  return (
    <div className="transition-opacity duration-1000">
      <ScrollNavigation />
      <Home />
      <Model />
      <About />
      <Skills />
      <Work />
      <Footer />
    </div>
  )
}

export default Page
