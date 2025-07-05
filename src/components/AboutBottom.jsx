'use client'

import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Skills from "./Skills"

gsap.registerPlugin(ScrollTrigger)

const AboutBottom = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none", // Animate once
            // markers: true, // Uncomment to debug
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#D9D9D9] w-full lg:px-32 overflow-x-hidden">
      <div id="aboutme">
        <div className="flex">
          <h3 className="font-title font-extrabold w-[20vw] reveal text-xl">WHO I AM ?</h3>
          <h3 className="w-[45vw] font-body text-[#666666] reveal">
            Hi I'm Aimane, a creative web developer based in Belgium. Currently
            focusing on frontend development and digital experiences. Passion
            for development/design fuels my drive to create immersive and
            visually captivating digital experiences that leave a lasting
            impression.
          </h3>
        </div>

        <div id="experience" className="flex mt-25">
          <div>
            <h3 className="font-title font-extrabold w-[20vw] reveal text-xl pt-15">MY EXPERIENCE</h3>
          </div>
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex justify-between mt-15">
                  <div>
                    <h3 className="font-title font-extrabold w-[45vw] pb-4 reveal text-xl">FRONTEND DEVELOPER</h3>
                    <p className="text-[#666666] leading-relaxed font-body reveal">
                      I specialize in web design and development for clients who
                      care about details. Building upon my experiences in digital
                      design across various industry sectors and numerous
                      projects, my goal is to create high-end web experiences that
                      make your brand go from a 'meh' to a 'woah'.
                    </p>
                  </div>
                  <div className="pl-20">
                    <h3 className="font-title font-extrabold w-[20vw] reveal text-xl">2025-PRESENT</h3>
                  </div>
                </div>
                <div className="w-[60vw] mt-15 h-[1px] bg-black"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Skills />
    </div>
  )
}

export default AboutBottom
