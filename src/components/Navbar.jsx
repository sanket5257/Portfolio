'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Link from 'next/link'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const menuItemsRef = useRef([])
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && menuItemsRef.current.length) {
      gsap.from(menuItemsRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
      })
    }
  }, [isClient])

  useEffect(() => {
    if (isOpen && isClient && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [isOpen, isClient])

  const handleHover = (e) => {
    if (!isClient) return
    gsap.to(e.currentTarget, {
      y: -5,
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleLeave = (e) => {
    if (!isClient) return
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <nav className="font-title absolute z-50 w-full top-0">
      <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-16">
        <div className="flex justify-between h-16 items-center text-[#D9D9D9]">
          <div className="flex-shrink-0">
            <span className="font-bold text-xl">Sanket.Dev</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center space-x-6">
            {['About', 'Work'].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                ref={(el) => (menuItemsRef.current[index] = el)}
                className="text-[#D9D9D9] will-change-transform cursor-pointer"
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                {item}
              </a>
            ))}
            <Link
              href="/contact"
              className="text-[#D9D9D9] will-change-transform cursor-pointer"
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              Contact
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#D9D9D9] hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-[#D9D9D9]/90 backdrop-blur-sm"
          id="mobile-menu"
        >
          <div className="px-4 pt-2 pb-4 space-y-2">
            {['Home', 'About', 'Services'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-4 py-2 rounded-md text-base font-medium text-black hover:text-white hover:bg-black transition will-change-transform"
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                {item}
              </a>
            ))}
            <Link
              href="/contact"
              className="block px-4 py-2 rounded-md text-base font-medium text-black hover:text-white hover:bg-black transition will-change-transform"
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
