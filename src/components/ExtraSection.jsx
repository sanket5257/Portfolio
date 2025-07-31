'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const features1 = ['Responsive', 'Secure', 'Fast', 'Animated', 'Accessible']
const features2 = ['Modern UI', 'SEO Friendly', 'Mobile First', 'Clean Code', 'Performance']

const ExtraSection = () => {
  const strip1Ref = useRef(null)
  const strip2Ref = useRef(null)

  useEffect(() => {
  const tl1 = gsap.to(strip1Ref.current, {
    x: '-50%',
    repeat: -1,
    ease: 'linear',
    duration: 20,
  })

  const tl2 = gsap.to(strip2Ref.current, {
    x: '-50%',
    repeat: -1,
    ease: 'linear',
    duration: 20,
  })

  return () => {
    tl1.kill()
    tl2.kill()
  }
}, [])

  return (
    <div className='bg-[#D9D9D9]  w-full min-h-screen overflow-hidden relative'>
      
<video
        autoPlay
        muted
        loop
        className="w-full object-cover"
        src="/herobgvid.webm"
      ></video>
      <div
  ref={strip1Ref}
  className="flex min-w-[200%] absolute top-1/2  whitespace-nowrap text-black font-title font-bold text-[6vw] sm:text-[3vw] opacity-70"
>
  {[...features1, ...features1].map((text, i) => (
    <span key={i} className="mx-[3vw] font-title">{text}</span>
  ))}
</div>


      {/* Strip 2 */}
     <div
  ref={strip2Ref}
  className="flex min-w-[200%] whitespace-nowrap absolute bottom-70 text-black font-title font-bold text-[6vw] sm:text-[3vw] opacity-70"
>
  {[...features2, ...features2].map((text, i) => (
    <span key={i} className="mx-[3vw] font-title2">{text}</span>
  ))}
</div>

    </div>
  )
}

export default ExtraSection
