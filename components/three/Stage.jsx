"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Preload, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { state, set, subscribe, getSnapshot } from "@/lib/store";
import Ruins from "./Ruins";
import Projects from "./Projects";
import Lines from "./Lines";
import Flower from "./Flower";
import Hand from "./Hand";

export const MODELS = [
  "/models/arch.glb",
  "/models/ruins.glb",
  "/models/fern.glb",
  "/models/monstera.glb",
  "/models/butterfly.glb",
  "/models/flower.glb",
  "/models/hand.glb",
  "/models/roots.glb",
  "/models/waterlily.glb",
  "/models/cliff.glb",
  "/models/boulder.glb",
  "/models/stairs.glb",
];
MODELS.forEach((m) => useGLTF.preload(m));

// Once every model is parsed, compile all programs up-front so the first
// scroll into each scene never hitches; then the loader may open its gate.
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let alive = true;
    const run = async () => {
      // never let a driver that stalls on parallel compile block the gate
      await Promise.race([gl.compileAsync(scene, camera).catch(() => {}), new Promise((r) => setTimeout(r, 4000))]);
      if (alive) set({ loaded: true });
    };
    run();
    return () => {
      alive = false;
    };
  }, [gl, scene, camera]);
  return null;
}

export default function Stage() {
  const { lite } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <Canvas
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      dpr={lite ? 1 : [1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 40, near: 0.05, far: 200, position: [0, 1.6, 8] }}
      onCreated={({ gl, scene }) => {
        if (process.env.NODE_ENV !== "production") window.__r3f = { gl, scene };
        gl.setClearColor("#000000");
        gl.toneMappingExposure = 0.85;
      }}
    >
      <Suspense fallback={null}>
        <Ruins />
        <Projects />
        <Lines />
        <Flower />
        <Hand />
        <Preload all />
        <Warmup />
      </Suspense>
      {!lite && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.75} />
          <Noise opacity={0.045} premultiply />
          <Vignette eskil={false} offset={0.28} darkness={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
