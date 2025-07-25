'use client'
import React, { useEffect, useRef } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { useLoader, useFrame } from '@react-three/fiber'
import { TextureLoader, MathUtils } from 'three'

const HeadModel = () => {
  const { scene } = useGLTF('/lieutenantHead/lieutenantHead.gltf')
  const modelRef = useRef()
  const targetRotation = useRef({ x: 0, y: 0 })

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

  // Mouse move listener
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1
      targetRotation.current = {
        x: y * 0.2 - 0.45,
        y: x * 0.5 + Math.PI
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Smoothly rotate model
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
        scale={[0.25, 0.25, 0.25]} // ✅ scaled down to fit screen
        castShadow
        receiveShadow
      />
    </Center>
  )
}

export default HeadModel
