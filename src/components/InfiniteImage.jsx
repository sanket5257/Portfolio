'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'

// 20 aesthetic movie stills (sample links, use your own if you want)
const IMAGES = [
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497294815431-9365093b7331?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1444065381814-865dc9da92c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b07?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b07?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500930281725-c3786ab8bdd3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1451481454041-104482d8e284?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516822003754-cca485356ecb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80'
]

// For each image, its own unique coordinate and slight rotation
const POSITIONS = [
  { top: '16%', left: '15%', rotate: -18 },
  { top: '21%', left: '50%', rotate: 7 },
  { top: '19%', left: '85%', rotate: -9 },
  { top: '36%', left: '27%', rotate: 5 },
  { top: '42%', left: '67%', rotate: 13 },
  { top: '32%', left: '80%', rotate: -5 },
  { top: '60%', left: '13%', rotate: 14 },
  { top: '65%', left: '38%', rotate: -8 },
  { top: '61%', left: '56%', rotate: 12 },
  { top: '74%', left: '47%', rotate: -16 },
  { top: '62%', left: '75%', rotate: -7 },
  { top: '76%', left: '81%', rotate: 10 },
  { top: '44%', left: '26%', rotate: -19 },
  { top: '23%', left: '33%', rotate: -11 },
  { top: '77%', left: '22%', rotate: 6 },
  { top: '55%', left: '89%', rotate: 9 },
  { top: '38%', left: '74%', rotate: -14 },
  { top: '35%', left: '19%', rotate: 15 },
  { top: '61%', left: '64%', rotate: -12 },
  { top: '72%', left: '56%', rotate: 8 }
]

const InfiniteImageReveal = () => {
  const imgRefs = useRef([])

  // Stagger in
  const handleMouseEnter = () => {
    gsap.to(imgRefs.current, {
      autoAlpha: 1,
      scale: 1,
      rotate: (i) => POSITIONS[i].rotate,
      duration: 0.7,
      ease: 'power3.out',
      stagger: {
        each: 0.08,
        from: 'random'
      }
    })
  }

  // Stagger out
  const handleMouseLeave = () => {
    gsap.to(imgRefs.current, {
      autoAlpha: 0,
      scale: 0.93,
      rotate: 0,
      duration: 0.4,
      ease: 'power3.in',
      stagger: {
        each: 0.05,
        from: 'random'
      }
    })
  }

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Staggered images */}
      {IMAGES.map((src, idx) => (
        <img
          key={idx}
          ref={el => imgRefs.current[idx] = el}
          src={src}
          alt=""
          style={{
            position: 'absolute',
            top: POSITIONS[idx].top,
            left: POSITIONS[idx].left,
            width: '260px',
            height: 'auto',
            opacity: 0,
            transform: 'scale(0.93)',
            pointerEvents: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
            borderRadius: '20px',
            zIndex: 10 + idx
          }}
        />
      ))}

      {/* Main content */}
      <div className="absolute top-8 right-10 text-white font-mono text-xs">MENU</div>
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-white font-title text-5xl tracking-widest">
        ROBOT
      </div>
      <div className="absolute left-0 bottom-0 text-white font-mono text-xl px-8 py-6">
        02/03
      </div>
      <div className="absolute right-0 bottom-0 text-white font-mono text-sm px-8 py-6">
        SCROLL
      </div>
      <div className="absolute left-24 top-[44%] text-white font-bold text-6xl tracking-tight leading-tight">
        BRANDED CONTENT
        <div className="text-base font-normal mt-4">
          [ VIEW ALL WORK ] &nbsp;&nbsp; [ VIEW DIRECTORS ]
        </div>
      </div>
    </div>
  )
}

export default InfiniteImageReveal
