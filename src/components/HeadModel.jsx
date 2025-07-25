'use client'
import React, { useEffect } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

const HeadModel = () => {
  const { scene } = useGLTF('/lieutenantHead/lieutenantHead.gltf')

  // ✅ Load 10 textures (Diffuse, Normal, AO for 3 parts)
  const [
    headDiffuse,
    headNormal,
    headAO,

    bodyDiffuse,
    bodyNormal,
    bodyAO,

    jacketDiffuse,
    jacketNormal,
    jacketAO,

    sharedExtraMap // optional 10th texture (e.g. for environment or fallback)
  ] = useLoader(TextureLoader, [
    '/lieutenantHead/Textures/Lieutenant_head_diffuse.jpeg',
    '/lieutenantHead/Textures/Lieutenant_head_normal.jpg',
    '/lieutenantHead/Textures/Lieutenant_head_ao.jpg',

    '/lieutenantHead/Textures/Lieutenant_Body_diffuse.jpg',
    '/lieutenantHead/Textures/Lieutenant_body_normal.jpg',
    '/lieutenantHead/Textures/Lieutenant_Body_ao.jpg',

    '/lieutenantHead/Textures/Lieutenant_jacket_diffuse.jpg',
    '/lieutenantHead/Textures/Lieutenant_jacket_normal.jpg',
    '/lieutenantHead/Textures/Lieutenant_jacket_ao.jpg',

    '/lieutenantHead/Textures/Lieutenant_jacket_specular.png' // Replace with any 10th texture
  ])

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material?.name) {
        const name = child.material.name.toLowerCase()

        // Some AO maps need UV2 manually set
        if (!child.geometry.attributes.uv2) {
          child.geometry.setAttribute('uv2', child.geometry.attributes.uv)
        }

        if (name.includes('head')) {
          child.material.map = headDiffuse
          child.material.normalMap = headNormal
          child.material.aoMap = headAO
        } else if (name.includes('body')) {
          child.material.map = bodyDiffuse
          child.material.normalMap = bodyNormal
          child.material.aoMap = bodyAO
        } else if (name.includes('jacket')) {
          child.material.map = jacketDiffuse
          child.material.normalMap = jacketNormal
          child.material.aoMap = jacketAO
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
