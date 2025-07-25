'use client'
import React from 'react'
import { useGLTF, Center } from '@react-three/drei'

const HeadModel = () => {
  const { scene } = useGLTF('/lieutenantHead/lieutenantHead.gltf')

  return (
    <Center>
      <primitive
        object={scene}
        rotation={[0, Math.PI, 0]} // Face camera
        castShadow
        receiveShadow
         scale={[0.2,0.2,0.2]} // 🔹 Smaller (50% of original size)
      />
    </Center>
  )
}

export default HeadModel
