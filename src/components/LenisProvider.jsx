'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
  const lenisRef = useRef()

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Make lenis available globally
    window.lenis = lenis

    // Add lenis class to html for CSS targeting
    document.documentElement.classList.add('lenis')

    // Animation frame loop
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // GSAP integration (if GSAP is available)
    if (typeof window !== 'undefined' && window.gsap) {
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
      })

      window.gsap.ticker.lagSmoothing(0)
    }

    // Cleanup
    return () => {
      document.documentElement.classList.remove('lenis')
      lenis.destroy()
      
      if (typeof window !== 'undefined' && window.gsap) {
        window.gsap.ticker.remove((time) => {
          lenis.raf(time * 1000)
        })
      }
    }
  }, [])

  return <>{children}</>
}