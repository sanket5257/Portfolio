'use client'

import React, { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import About from './About'
import Work from './Work'
import Footer from '@/components/Footer'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import HeadModel from '@/components/HeadModel'
import ExtraSection from '@/components/ExtraSection'



const RollingText = ({ text, className = '' }) => <span className={className}>{text}</span>
const MainRollingText = ({ text, className = '' }) => <span className={className}>{text}</span>

const Page = () => {
  return (
    <>
      <Navbar />

      {/* 3D Background */}
      <div className="absolute bg-black inset-0 z-0 pointer-events-none w-full h-screen">
       

      </div>

      {/* Hero Section */}
      <div className="relative w-full h-screen pointer-events-none">
        <div className="absolute inset-0 z-10 text-[#D9D9D9] flex flex-col justify-between items-center px-4 sm:px-10 py-8">
          <div
            id="hero-center"
            className="flex justify-between items-center w-full max-w-7xl mx-auto h-full"
          >
            <div id="left-text" className="hidden md:block">
              <h3 className="font-title">
                <RollingText text="LINKEDIN" />
              </h3>
            </div>

            {/* Optional Center Text */}
            {/* <div className="text-center">
              <h1 className="font-title uppercase font-extrabold text-[clamp(2rem,10vw,10rem)] leading-tight">
                <MainRollingText text="sanket," />
              </h1>
              <h2 className="font-title2 text-[clamp(1rem,6vw,4rem)] pl-4 md:pl-20">
                <MainRollingText text="Chougule" />
              </h2>
            </div> */}

            <div className="hidden md:block">
              <h3 className="font-title">
                <RollingText text="INSTAGRAM" />
              </h3>
            </div>
          </div>

          <div id="hero-end" className="font-title text-center">
            <h3 className="text-[clamp(0.8rem,2vw,1.2rem)]">
              <RollingText text="WEBDESIGNER" />
            </h3>
            <h3 className="text-[clamp(0.8rem,2vw,1.2rem)]">
              <RollingText text="& DEVELOPER" />
            </h3>
          </div>
        </div>
      </div>

      <About />
     
      <Work />
      <Footer />
    </>
  )
}

export default Page
