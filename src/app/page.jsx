'use client'

import React, { useState, useEffect } from 'react'
import About from './About'
import Work from './Work'
import Footer from '@/components/Footer'
import Home from './Hero'
import Model from './Model'
const Page = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768) // Tailwind's md breakpoint
    }

    checkScreen()
    window.addEventListener('resize', checkScreen)

    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-xl font-semibold">
        Please view on desktop
      </div>
    )
  }

  return (
    <>
      <Home />
      <Model/>
      <About />
      <Work />
      <Footer />
    </>
  )
}

export default Page
