'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuItemsRef = useRef([]) // for desktop links
  const mobileMenuRef = useRef(null)

  // Animate desktop nav on mount
  useEffect(() => {
    gsap.from(menuItemsRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    })
  }, [])

  // Animate mobile menu on open
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [isOpen])

  // GSAP hover animation
  const handleHover = (e) => {
    gsap.to(e.currentTarget, {
      y: -5,
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleLeave = (e) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <nav className="font-title absolute z-50 w-full top-0">
      <div className="w-full px-4 sm:px-6 lg:px-16">
        <div className="flex justify-between h-16 text-[#D9D9D9] items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="font-bold text-xl text-[#D9D9D9]">Sanket.Dev</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center space-x-6">
            {['About', 'Work', 'Contact'].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                ref={(el) => (menuItemsRef.current[index] = el)}
                className="text-[#D9D9D9] will-change-transform"
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex font-title items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
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
        <div ref={mobileMenuRef} className="md:hidden bg-[#D9D9D9]/90 backdrop-blur-sm" id="mobile-menu">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {['Home', 'About', 'Services', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-white hover:bg-black transition will-change-transform"
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
