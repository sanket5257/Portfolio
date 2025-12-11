// Utility functions for smooth scrolling with Lenis

export const scrollTo = (target, options = {}) => {
  if (typeof window !== 'undefined' && window.lenis) {
    window.lenis.scrollTo(target, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options
    })
  }
}

export const scrollToTop = (options = {}) => {
  scrollTo(0, options)
}

export const scrollToElement = (selector, options = {}) => {
  scrollTo(selector, options)
}

export const scrollBy = (distance, options = {}) => {
  if (typeof window !== 'undefined' && window.lenis) {
    const currentScroll = window.lenis.scroll
    scrollTo(currentScroll + distance, options)
  }
}

// Stop smooth scrolling
export const stopScroll = () => {
  if (typeof window !== 'undefined' && window.lenis) {
    window.lenis.stop()
  }
}

// Start smooth scrolling
export const startScroll = () => {
  if (typeof window !== 'undefined' && window.lenis) {
    window.lenis.start()
  }
}