'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useMemo, useEffect } from 'react';
import { ContactShadows, AdaptiveDpr, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import DeskScene from './DeskScene';
import { camera as camCfg, parallax, SCENE_OBJECTS } from '@/lib/models';

const TARGET = new THREE.Vector3(...camCfg.target);
const DIR = new THREE.Vector3(...camCfg.dir).normalize();

/* Bounding-sphere fit → base camera position + look height, exactly
   like the reference (distance = radius / sin(minFov/2) · breakpoint). */
function useFit() {
  const { size } = useThree();
  return useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const vfov = THREE.MathUtils.degToRad(camCfg.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const a = Math.min(vfov, hfov);
    const small = size.width < 1536;
    const mult = size.width < 768 ? 0.62 : small ? 0.72 : 0.98;
    const c = (camCfg.radius / Math.sin(a / 2)) * mult;
    const pos = TARGET.clone().addScaledVector(DIR, c);
    const look = new THREE.Vector3(TARGET.x, TARGET.y + c * (small ? -0.04 : 0.03), TARGET.z);
    return { pos, look, dist: c };
  }, [size.width, size.height]);
}

// Per-object camera framing when a panel opens (dolly toward it).
const FOCUS_LIFT = { monitor: 0.55, notebook: 0.1, cup: 0.15 };
function focusFor(focusId, fit) {
  const obj = focusId && SCENE_OBJECTS.find((o) => o.id === focusId);
  if (!obj) return null;
  const target = new THREE.Vector3(...obj.position);
  target.y += FOCUS_LIFT[focusId] ?? 0.1;
  const pos = target.clone().addScaledVector(DIR, fit.dist * 0.5);
  return { pos, target };
}

function CameraRig({ focusId }) {
  const { camera } = useThree();
  const fit = useFit();
  const focus = useMemo(() => focusFor(focusId, fit), [focusId, fit]);
  const curPos = useRef(fit.pos.clone());
  const curLook = useRef(fit.look.clone());
  const tmpOffset = new THREE.Vector3();
  const pitchAxis = useMemo(
    () => new THREE.Vector3().crossVectors(DIR, new THREE.Vector3(0, 1, 0)).normalize(),
    []
  );

  useEffect(() => {
    camera.position.copy(fit.pos);
    curPos.current.copy(fit.pos);
    curLook.current.copy(fit.look);
    camera.lookAt(fit.look);
  }, [fit, camera]);

  useFrame((state, dt) => {
    const focused = !!focus;
    let destPos, destLook;

    if (focused) {
      destPos = focus.pos;
      destLook = focus.target;
    } else {
      // pitch parallax: orbit the base offset a few degrees on mouse-Y.
      tmpOffset.copy(fit.pos).sub(fit.look);
      const pitch = -state.pointer.y * parallax.pitch;
      tmpOffset.applyAxisAngle(pitchAxis, pitch);
      destPos = tmpOffset.add(fit.look);
      destLook = fit.look;
    }

    const k = Math.min(1, dt * (focused ? 3.2 : 4));
    curPos.current.lerp(destPos, k);
    curLook.current.lerp(destLook, k);
    camera.position.copy(curPos.current);
    camera.lookAt(curLook.current);
  });

  return null;
}

/* Key/fill/ambient lights that fade down when the lamp switches on. */
const LIGHTS = {
  ambient: { on: 0.32, dim: 0.07 },
  hemi: { on: 0.42, dim: 0.1 },
  key: { on: 1.75, dim: 0.4 },
  fill: { on: 0.35, dim: 0.08 },
  env: { on: 0.3, dim: 0.08 },
};
function SceneLights({ lampOn }) {
  const scene = useThree((s) => s.scene);
  const amb = useRef();
  const hemi = useRef();
  const key = useRef();
  const fill = useRef();
  const t = useRef(0); // 0 = full room light, 1 = dimmed

  useFrame((_, dt) => {
    t.current += ((lampOn ? 1 : 0) - t.current) * Math.min(1, dt * 3);
    const mix = (l) => l.on + (l.dim - l.on) * t.current;
    if (amb.current) amb.current.intensity = mix(LIGHTS.ambient);
    if (hemi.current) hemi.current.intensity = mix(LIGHTS.hemi);
    if (key.current) key.current.intensity = mix(LIGHTS.key);
    if (fill.current) fill.current.intensity = mix(LIGHTS.fill);
    scene.environmentIntensity = mix(LIGHTS.env);
  });

  return (
    <>
      <ambientLight ref={amb} intensity={LIGHTS.ambient.on} />
      <hemisphereLight ref={hemi} args={['#cfe0ee', '#1a2832', LIGHTS.hemi.on]} />
      <directionalLight
        ref={key}
        castShadow
        position={[6, 11, 4]}
        intensity={LIGHTS.key.on}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
      <directionalLight ref={fill} position={[-6, 5, -3]} intensity={LIGHTS.fill.on} color="#a9c4d8" />
    </>
  );
}

/* Image-based lighting generated on the GPU from three's built-in
   RoomEnvironment. Replaces drei's <Environment preset="city">, which
   fetched a ~2 MB HDR from a third-party CDN (raw.githack.com → a 301 to
   raw.githubusercontent.com) *inside the model Suspense boundary* — so the
   whole desk waited on two cross-origin round-trips and showed nothing at
   all when that CDN was slow, blocked or offline. This is synchronous,
   local, and costs one render to a small cubemap. */
function LocalEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const rt = pmrem.fromScene(room, 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = LIGHTS.env.on;
    room.dispose?.();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      rt.dispose();
    };
  }, [gl, scene]);

  return null;
}

/* Fires once, on the first frame rendered after the Suspense boundary has
   resolved and <Preload all /> has compiled the shaders — i.e. the first
   moment there is genuinely something on screen. */
function ReadySignal({ onReady }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onReady?.();
  });
  return null;
}

export default function Scene({ onInteract, focusId, musicOn, lampOn, onReady }) {
  return (
    <Canvas
      shadows
      /* 2× DPR on a 4K/retina panel means 4× the fragment work for a scene
         this heavy. 1.6 is visually indistinguishable here with AA on. */
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMappingExposure: 0.9,
      }}
      camera={{ position: [8, 7, 9], fov: camCfg.fov, near: 0.1, far: 100 }}
    >
      <CameraRig focusId={focusId} />

      {/* Global lights dim down when the lamp is on, so its warm pool
          becomes the dominant source (room-goes-dark → lamp lights the desk). */}
      <SceneLights lampOn={lampOn} />

      {/* Local IBL — outside Suspense, so it can never gate the models. */}
      <LocalEnvironment />

      <Suspense fallback={null}>
        <DeskScene
          onInteract={onInteract}
          musicOn={musicOn}
          lampOn={lampOn}
          focusId={focusId}
        />
        {/* Compile every shader / upload every texture before the first
            visible frame, so the intro doesn't stutter on frame one. */}
        <Preload all />
        <ReadySignal onReady={onReady} />
      </Suspense>

      {/* floor catches the cast shadow on the blue backdrop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial transparent opacity={0.4} />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.38} scale={18} blur={2.4} far={5} color="#0a1a26" />

      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
