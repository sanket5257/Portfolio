'use client'

import React, { useRef, useState, useEffect } from 'react'

const GlobalAudioPlayer = ({ src = '/track.mp3' }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Autoplay muted to avoid browser block
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = true
      audioRef.current.play().catch(err => {
        console.log('Autoplay blocked until user interacts:', err)
      })
    }
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.muted = false
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={src} loop />

      {/* Floating Music Button */}
      <button
        onClick={toggleMusic}
        className="fixed cursor-pointer bottom-5 right-5 z-50 bg-black/50 rounded-full p-3 pointer-events-auto"
      >
        {isPlaying ? (
          // Animated Wave Bars
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect className="wave-bar bar1" x="4" y="4" width="3" height="16" rx="1" />
            <rect className="wave-bar bar2" x="10.5" y="4" width="3" height="16" rx="1" />
            <rect className="wave-bar bar3" x="17" y="4" width="3" height="16" rx="1" />
          </svg>
        ) : (
          // Play Icon
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Wave Animation */}
      <style jsx>{`
        .wave-bar {
          transform-origin: center;
          animation: waveAnim 1s ease-in-out infinite;
        }
        .bar1 {
          animation-delay: 0s;
        }
        .bar2 {
          animation-delay: 0.2s;
        }
        .bar3 {
          animation-delay: 0.4s;
        }
        @keyframes waveAnim {
          0%, 100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </>
  )
}

export default GlobalAudioPlayer
