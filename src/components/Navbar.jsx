'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="font-title absolute z-50 w-full top-0">
      <div className="w-full py-5 px-4 sm:px-6 lg:px-16">
        <div className=" h-16 items-center text-[#D9D9D9]">
          {/* Desktop Menu */}
          <div className="hidden text-sm md:flex md:items-center justify-between">
            <h3>Independent Creative Developer <br /><span className='text-[#666666]'>& Designer</span> </h3>
            <h3>Sanket Chougule <br /><span className='text-[#666666]'>Follower of creativity</span> </h3>
            {['About', 'Work'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[#D9D9D9] cursor-pointer"
              >
                {item}
              </a>
            ))}
            <Link
              href="/contact"
              className="text-[#D9D9D9] cursor-pointer"
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
        <div className="md:hidden bg-[#D9D9D9]/90 backdrop-blur-sm" id="mobile-menu">
          <div className="px-4 pt-2 pb-4 space-y-2">

            {['Home', 'About', 'Services'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-4 py-2 rounded-md text-base font-medium text-black hover:text-white hover:bg-black transition"
              >
                {item}
              </a>
            ))}
            <Link
              href="/contact"
              className="block px-4 py-2 rounded-md text-base font-medium text-black hover:text-white hover:bg-black transition"
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
