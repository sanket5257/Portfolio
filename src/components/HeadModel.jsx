'use client'

import React, { useRef } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const HeadModel = () => {
  const { scene } = useGLTF('/gaming room/glb.gltf')
  const modelRef = useRef()

  // Track mouse position
  const mouse = useRef({ x: 0, y: 0 })

  const handlePointerMove = (event) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  // Animate rotation on every frame
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = mouse.current.x * 0.5 // Horizontal rotation
      modelRef.current.rotation.x = mouse.current.y * 0.3 // Vertical tilt
    }
  })

  return (
    <Center onPointerMove={handlePointerMove}>
      <primitive
        ref={modelRef}
        object={scene}
        scale={[0.25, 0.25, 0.25]}
        castShadow
        receiveShadow
      />
    </Center>
  )
}

export default HeadModel
