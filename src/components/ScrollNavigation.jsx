'use client'

import { useScrollTo } from '../hooks/useLenis'

export default function ScrollNavigation() {
  const scrollTo = useScrollTo()

  const navItems = [
    { label: 'Home', target: 0 },
    { label: 'About', target: '#about' },
    { label: 'Skills', target: '#skills' },
    { label: 'Work', target: '#work' },
    { label: 'Contact', target: '#contact' }
  ]

  return (
    <nav className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50 space-y-4">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={() => scrollTo(item.target)}
          className="block w-3 h-3 rounded-full bg-white/30 hover:bg-white/80 transition-colors duration-300 backdrop-blur-sm"
          aria-label={`Scroll to ${item.label}`}
        />
      ))}
    </nav>
  )
}