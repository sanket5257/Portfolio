'use client'
import React from 'react'



import Navbar from '@/components/Navbar'
import About from './About'
import Work from './Work'
import Footer from '@/components/Footer'
// app/page.jsx or any component


import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import HeadModel from '@/components/HeadModel'




// Simple text wrappers
const RollingText = ({ text, className = '' }) => <span className={className}>{text}</span>
const MainRollingText = ({ text, className = '' }) => <span className={className}>{text}</span>

const Page = () => {
  return (
    <>
      <Navbar />

      {/* 3D Background */}
      <div className="absolute bg-black inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 0, 2], fov: 45 }}>
  <ambientLight intensity={1} />
  <directionalLight position={[2, 2, 2]} intensity={1.5} />
  <HeadModel />
  <Environment preset="sunset" />
  <OrbitControls enableZoom />
</Canvas>


      </div>

      {/* Hero Section */}
      <div className="relative w-full h-screen">
        <div className="absolute inset-0 z-10 pointer-events-none text-[#D9D9D9]">
          <div
            id="hero-center"
            className="h-[80vh] lg:px-16 flex justify-between items-center w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center"
          >
            <div id="left-text">
              <h3 className="font-title hidden md:block">
                <RollingText text="LINKEDIN" />
              </h3>
            </div>
            {/* <div className="text-center">
              <h1 className="font-title uppercase font-extrabold text-[15vw] lg:leading-[20vh] sm:text-[8vw] lg:text-[12vw]">
                <MainRollingText text="sanket," />
              </h1>
              <h1 className="font-title2 text-[9vw] pl-[10vw] sm:pl-[20vw] lg:pl-[30vw] sm:text-[4vw] lg:text-[5vw]">
                <MainRollingText text="Chougule" />
              </h1>
            </div> */}
            <div>
              <h3 className="font-title hidden md:block">
                <RollingText text="INSTAGRAM" />
              </h3>
            </div>
          </div>

          <div id="hero-end" className="absolute font-title flex justify-start items-center flex-col bottom-0 h-[15vh] w-full">
            <h3 className="text-[4vw] sm:text-[2vw] md:text-[1vw]">
              <RollingText text="WEBDESIGNER" />
            </h3>
            <h3 className="text-[4vw] sm:text-[2vw] md:text-[1vw]">
              <RollingText text="& DEVELOPER" />
            </h3>
          </div>
        </div>
      </div>

      {/* Sections */}
      <About />
      <Work />
      <Footer />
    </>
  )
}

export default Page
