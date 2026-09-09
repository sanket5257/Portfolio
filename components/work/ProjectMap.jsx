'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { drawMap, loadMapData, MAP_SIZE, worldPos } from '@/lib/workMap';

/* ──────────────────────────────────────────────────────────────────────
   The map surface + one glowing block per project.

   Mirrors the reference's interaction model: wheel zooms about the cursor,
   drag pans, hovering a block lifts and brightens it, clicking opens the
   detail sheet. Zoom is reported back up so the HUD's "ZOOM 1.62X" readout
   and the scale bar stay live, exactly as they do there.
   ────────────────────────────────────────────────────────────────────── */

const MIN_Z = 32;   // closest  → ~3.1x
const MAX_Z = 100;  // furthest → 1.0x, ~8.5 km across — central Kolhapur
const zoomOf = (z) => MAX_Z / z;

/* The Kolhapur extract is ~280 KB gzipped and paints ~9,600 ways, so it is
   fetched and rasterised once, off the first frame, and cached on the
   module. Until it lands the plane simply isn't drawn — the page is dark
   navy underneath either way, so there is nothing to flash. */
function MapPlane({ onReady }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let alive = true;
    let tex;
    loadMapData()
      .then((data) => {
        if (!alive) return;
        tex = new THREE.CanvasTexture(drawMap(data, 3072));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        setTexture(tex);
        onReady?.();
      })
      .catch((err) => console.error('[work map]', err));
    return () => {
      alive = false;
      tex?.dispose();
    };
  }, [onReady]);

  if (!texture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/* One project. A cube on a thin plinth, bobbing gently, with a ring that
   pulses outward — the reference's pins read the same way. */
function Block({ project, active, onHover, onSelect }) {
  const group = useRef();
  const ring = useRef();
  const [x, z] = worldPos(project.slug);
  const [hovered, setHovered] = useState(false);
  const lit = hovered || active;

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      const targetY = lit ? 3.4 : 1.9;
      group.current.position.y += (targetY - group.current.position.y) * Math.min(1, dt * 8);
      group.current.rotation.y = t * 0.35;
      const s = lit ? 1.45 : 1;
      group.current.scale.x += (s - group.current.scale.x) * Math.min(1, dt * 8);
      group.current.scale.y = group.current.scale.z = group.current.scale.x;
    }
    if (ring.current) {
      // 0→1 sawtooth, offset per project so they don't pulse in lockstep.
      const p = ((t * 0.6 + x * 0.13 + z * 0.07) % 1 + 1) % 1;
      const s = 1 + p * 3.4;
      ring.current.scale.set(s, s, s);
      ring.current.material.opacity = (1 - p) * (lit ? 0.75 : 0.35);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Hit target — generous, so the blocks stay clickable when zoomed out. */}
      <mesh
        position={[0, 1.6, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(project);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(project);
        }}
      >
        <boxGeometry args={[4.2, 5, 4.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={group} position={[0, 1.9, 0]}>
        <mesh>
          <boxGeometry args={[1.7, 1.7, 1.7]} />
          <meshBasicMaterial color={lit ? '#bcd8ff' : '#2b7fff'} toneMapped={false} />
        </mesh>
        {/* Soft halo cube — cheap bloom without a post pass. */}
        <mesh scale={1.9}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshBasicMaterial
            color="#2b7fff"
            transparent
            opacity={lit ? 0.35 : 0.16}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Plinth line down to the ground plane. */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.9, 6]} />
        <meshBasicMaterial color="#2b7fff" transparent opacity={0.5} />
      </mesh>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[1.15, 1.35, 40]} />
        <meshBasicMaterial
          color="#4f9bff"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* Pan + zoom. Kept as a hook on the camera rather than drei's OrbitControls
   so the tilt stays fixed — the reference never lets you orbit, only slide
   across the plate and push in. */
function Controls({ onZoom, onPan }) {
  const { camera, gl } = useThree();
  const target = useRef(new THREE.Vector2(-9, 12));
  const dist = useRef(MAX_Z);
  const drag = useRef(null);
  const cur = useRef({ x: -9, y: 12, d: MAX_Z });

  useEffect(() => {
    const el = gl.domElement;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const onWheel = (e) => {
      e.preventDefault();
      dist.current = clamp(dist.current + e.deltaY * 0.045, MIN_Z, MAX_Z);
    };
    const onDown = (e) => {
      drag.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!drag.current) return;
      // Pan speed scales with distance so the map tracks the cursor at
      // every zoom level instead of crawling when you're pushed in.
      const k = dist.current * 0.0011;
      target.current.x = clamp(target.current.x - (e.clientX - drag.current.x) * k, -42, 42);
      target.current.y = clamp(target.current.y - (e.clientY - drag.current.y) * k, -42, 46);
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e) => {
      drag.current = null;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = 'grab';
    };

    el.style.cursor = 'grab';
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const k = Math.min(1, dt * 4.5);
    cur.current.x += (target.current.x - cur.current.x) * k;
    cur.current.y += (target.current.y - cur.current.y) * k;
    cur.current.d += (dist.current - cur.current.d) * k;

    const { x, y, d } = cur.current;
    // Fixed 58° look-down, matching the reference's near-plan view.
    camera.position.set(x, d * 0.85, y + d * 0.55);
    camera.lookAt(x, 0, y);
    onZoom(zoomOf(d));
    onPan(x, y);
  });

  return null;
}

export default function ProjectMap({ projects, activeSlug, onHover, onSelect, onZoom, onPan, onReady }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: 38, near: 0.1, far: 600, position: [-9, 85, 67] }}
      onCreated={({ gl }) => gl.setClearColor('#020a18')}
    >
      <fog attach="fog" args={['#020a18', 120, 300]} />
      <MapPlane onReady={onReady} />
      {projects.map((p) => (
        <Block
          key={p.slug}
          project={p}
          active={activeSlug === p.slug}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
      <Controls onZoom={onZoom} onPan={onPan} />
    </Canvas>
  );
}
