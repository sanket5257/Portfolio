'use client'
import React, { useEffect } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { TextureLoader } from 'three'
import { useLoader } from '@react-three/fiber'

const HeadModel = () => {
  const { scene } = useGLTF('/lieutenantHead/lieutenantHead.gltf')
  const texture = useLoader(TextureLoader, '/lieutenantHead/Textures/Lieutenant_head_diffuse.jpeg')

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture
        child.material.needsUpdate = true
      }
    })
  }, [scene, texture])

  return (
    <Center>
      <primitive
        object={scene}
        rotation={[0, Math.PI, 0]}
        scale={[0.2, 0.2, 0.2]}
        castShadow
        receiveShadow
      />
    </Center>
  )
}

export default HeadModel
