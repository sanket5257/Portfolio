'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { useLoader, useFrame, invalidate } from '@react-three/fiber'
import { TextureLoader, MathUtils } from 'three'

const HeadModel = () => {
  const { scene } = useGLTF('/lieutenantHead/lieutenantHead.gltf')
  const modelRef = useRef()
  const targetRotation = useRef({ x: 0, y: 0 })

  const [modelScale, setModelScale] = useState([0.25, 0.25, 0.25])

  // Load textures
  const [
    headDiffuse,
    headNormal,
    bodyDiffuse,
    bodyNormal,
    jacketDiffuse,
    jacketNormal
  ] = useLoader(TextureLoader, [
    '/lieutenantHead/Textures/Lieutenant_head_diffuse.jpeg',
    '/lieutenantHead/Textures/Lieutenant_head_normal.jpg',
    '/lieutenantHead/Textures/Lieutenant_Body_diffuse.jpg',
    '/lieutenantHead/Textures/Lieutenant_body_normal.jpg',
    '/lieutenantHead/Textures/Lieutenant_jacket_diffuse.jpg',
    '/lieutenantHead/Textures/Lieutenant_jacket_normal.jpg'
  ])

  // Apply textures
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material?.name) {
        const name = child.material.name.toLowerCase()
        if (name.includes('head')) {
          child.material.map = headDiffuse
          child.material.normalMap = headNormal
        } else if (name.includes('body')) {
          child.material.map = bodyDiffuse
          child.material.normalMap = bodyNormal
        } else if (name.includes('jacket')) {
          child.material.map = jacketDiffuse
          child.material.normalMap = jacketNormal
        }
        child.material.needsUpdate = true
      }
    })
  }, [scene])

  // Responsive scale
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setModelScale([0.18, 0.18, 0.18])
      } else if (width < 1024) {
        setModelScale([0.22, 0.22, 0.22])
      } else {
        setModelScale([0.25, 0.25, 0.25])
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mouse move listener
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1

      const rotX = MathUtils.clamp(y * 0.15 + 0, -0.2, 0.2)
      const rotY = MathUtils.clamp(x * 0.3 + Math.PI, Math.PI - 0.3, Math.PI + 0.3)

      targetRotation.current = { x: rotX, y: rotY }
      invalidate() // manual render trigger for demand mode
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Smooth rotation
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = MathUtils.lerp(
        modelRef.current.rotation.y,
        targetRotation.current.y,
        0.1
      )
      modelRef.current.rotation.x = MathUtils.lerp(
        modelRef.current.rotation.x,
        targetRotation.current.x,
        0.1
      )
    }
  })

  return (
    <Center>
      <primitive
        ref={modelRef}
        object={scene}
        scale={modelScale}
        castShadow
        receiveShadow
      />
    </Center>
  )
}

export default HeadModel
