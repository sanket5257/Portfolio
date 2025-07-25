'use client'
import React, { useEffect } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

const HeadModel = () => {
  const { scene } = useGLTF('/lieutenantHead/lieutenantHead.gltf')

  // ✅ Load 6 required textures (Diffuse + Normal for each part)
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

  return (
    <Center>
      <primitive
        object={scene}
        scale={[0.5, 0.5, 0.5]}
        rotation={[-0.45, Math.PI, 0]}
        castShadow
        receiveShadow
      />
    </Center>
  )
}

export default HeadModel
