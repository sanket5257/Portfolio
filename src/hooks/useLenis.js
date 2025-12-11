'use client'

import { useEffect, useState } from 'react'

export function useLenis(callback, deps = []) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    // Get lenis instance from window (if available)
    const lenisInstance = window.lenis
    if (lenisInstance) {
      setLenis(lenisInstance)
    }
  }, [])

  useEffect(() => {
    if (lenis && callback) {
      lenis.on('scroll', callback)
      return () => lenis.off('scroll', callback)
    }
  }, [lenis, callback, ...deps])

  return lenis
}

export function useScrollTo() {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    const lenisInstance = window.lenis
    if (lenisInstance) {
      setLenis(lenisInstance)
    }
  }, [])

  const scrollTo = (target, options = {}) => {
    if (lenis) {
      lenis.scrollTo(target, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        ...options
      })
    }
  }

  return scrollTo
}