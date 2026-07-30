'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { useGLTF, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_OBJECTS, parallax } from '@/lib/models';
import { playSample } from '@/lib/audio';

/* A calm code-editor drawn on the monitor screen — the scene's own code,
   typed out line by line. Muted syntax colours matching the studio theme. */
const SCREEN_W = 512;
const SCREEN_H = 340;
const KW = '#7dd3c0'; // keyword (teal accent)
const STR = '#9bb089'; // string (muted green)
const FN = '#e0af68'; // function (amber)
const VAR = '#82aaff'; // variable (soft blue)
const CM = '#5c6773'; // comment (grey)
const TAG = '#7aa2f7'; // JSX tag (blue)
const NUM = '#d19a66'; // number (orange)
const PL = '#aeb9c4'; // plain
const CODE = [
  [['import', KW], [' { Canvas } ', PL], ['from', KW], [" '@react-three/fiber'", STR]],
  [['import', KW], [' { useRef } ', PL], ['from', KW], [" 'react'", STR]],
  [],
  [['export default function ', KW], ['Scene', FN], ['() {', PL]],
  [['  const ', KW], ['rig', VAR], [' = ', PL], ['useRef', FN], ['()', PL]],
  [['  // one memorable signature scene', CM]],
  [['  return (', PL]],
  [['    <', PL], ['Canvas', TAG], [' camera={{ fov: ', PL], ['30', NUM], [' }}>', PL]],
  [['      <', PL], ['DeskScene', TAG], [' />', PL]],
  [['    </', PL], ['Canvas', TAG], ['>', PL]],
  [['  )', PL]],
  [['}', PL]],
];

function drawScreen(g, t) {
  const W = SCREEN_W;
  const H = SCREEN_H;

  // editor background
  g.fillStyle = '#0c1119';
  g.fillRect(0, 0, W, H);

  // title bar
  g.fillStyle = '#121a26';
  g.fillRect(0, 0, W, 34);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(20 + i * 20, 17, 5, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = 'rgba(174,185,196,0.55)';
  g.font = '13px system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText('Scene.jsx', W / 2, 22);
  g.textAlign = 'left';

  // typing cycle
  let total = 0;
  CODE.forEach((l) => l.forEach((s) => (total += s[0].length)));
  const cps = 22;
  const cycle = total / cps + 3.2; // type, then hold, then restart
  let remaining = Math.min(total, Math.floor((t % cycle) * cps));

  g.font = '15px Menlo, Consolas, monospace';
  const ch = g.measureText('M').width;
  const gutterX = 14;
  const codeX = 44;
  const y0 = 60;
  const lh = 20.5;
  let curX = codeX;
  let curY = y0;
  let stop = false;

  for (let li = 0; li < CODE.length && !stop; li++) {
    const yy = y0 + li * lh;
    g.fillStyle = 'rgba(92,103,115,0.45)';
    g.fillText(String(li + 1).padStart(2, ' '), gutterX, yy);
    let x = codeX;
    for (const [text, color] of CODE[li]) {
      if (remaining <= 0) {
        stop = true;
        break;
      }
      const take = Math.min(text.length, remaining);
      g.fillStyle = color;
      g.fillText(text.slice(0, take), x, yy);
      remaining -= take;
      curX = x + take * ch;
      curY = yy;
      if (take < text.length) {
        stop = true;
        break;
      }
      x += text.length * ch;
    }
    if (!stop) {
      curX = x;
      curY = yy;
    }
  }

  // blinking caret
  if (Math.floor(t * 2) % 2 === 0) {
    g.fillStyle = 'rgba(125,211,192,0.9)';
    g.fillRect(curX + 1, curY - 12, 2, 15);
  }
}

/* ============================================================
   GLB slot — recenter so the model's base sits on y=0 and it's
   centered in x/z, exactly like the reference. Shadows on.
   ============================================================ */
// Tonearm swing (pivot rotation, radians): playing sets the needle on the
// record's outer groove; stopped lifts it off to the parked position.
// Measured from the GLB: the arm pivots at root31 (x 0.646, z -0.369) and the
// stylus (root35) traces a circle of radius 1.182 about it, while the record
// (root2) is centred at (-0.181, 0.100) with radius 0.685. Solving that
// triangle, -0.30 drops the needle 0.681 from the centre — balanced on the
// bare rim. -0.44 sets it down at 0.548, i.e. 80% out, on the vinyl proper.
const TONEARM_PLAY = -0.44;
const TONEARM_PARK = 0.12;

function GLBModel({ file, musicOn, lampOn }) {
  const { scene } = useGLTF(`/models/${file}.glb`);
  const model = useMemo(() => scene.clone(true), [scene]);
  const recenter = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const c = box.getCenter(new THREE.Vector3());
    return [-c.x, -box.min.y, -c.z];
  }, [model]);

  // Lamp: reflector head ≈ top of the model, reaching forward on the long axis.
  const lampHead = useMemo(() => {
    if (file !== 'lamp') return null;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const H = size.y;
    // in recentered group space: x/z centered on 0, base at y=0
    const zReach = size.z > size.x ? size.z / 2 - 0.2 : 0;
    const xReach = size.x > size.z ? size.x / 2 - 0.2 : 0;
    return [xReach, H - 0.35, zReach];
  }, [model, file]);

  // Monitor: a live animated visualizer drawn on the front face.
  const screen = useMemo(() => {
    if (file !== 'monitor' || typeof document === 'undefined') return null;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const cvs = document.createElement('canvas');
    cvs.width = SCREEN_W;
    cvs.height = SCREEN_H;
    const ctx = cvs.getContext('2d');
    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return {
      ctx,
      tex,
      width: size.x * 0.9,
      height: size.y * 0.76,
      z: size.z / 2 + 0.02,
      cy: size.y * 0.665,
    };
  }, [model, file]);

  // Turntable: the platter (root2) spins; the tonearm swings between its
  // on-record position (0°, playing) and a parked angle (stopped).
  // Names are 'root.2' / 'root.3.0' in the GLB, but GLTFLoader runs them
  // through PropertyBinding.sanitizeNodeName, which strips the reserved
  // characters [].:/ — so they arrive here as 'root2' / 'root30'.
  const platter = useMemo(
    () => (file === 'turntable' ? model.getObjectByName('root2') : null),
    [model, file]
  );
  const armPivot = useRef(null);
  const nextScreenDraw = useRef(0); // throttles the canvas-texture upload

  useEffect(() => {
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    if (file !== 'turntable') return;
    const arm = ['root30', 'root32', 'root33', 'root34', 'root35']
      .map((n) => model.getObjectByName(n))
      .filter(Boolean);
    const base = model.getObjectByName('root31');
    if (!arm.length || !base) return;
    // Box3 measures in *world* space, but the pivot is a child of `model`, so
    // its position is a *local* offset. Copying the world centre straight in
    // leaks the desk placement (scale 0.55, y 1.65, yaw 90°) into the local
    // frame and parks the rotation axis ~1.7 units off to the side — the arm
    // still lands right on mount (attach preserves world transform) but then
    // sweeps a wildly wrong arc. Convert to the model's frame first.
    model.updateWorldMatrix(true, true);
    const c = new THREE.Vector3();
    new THREE.Box3().setFromObject(base).getCenter(c);
    model.worldToLocal(c);
    const pivot = new THREE.Group();
    pivot.position.copy(c);
    model.add(pivot);
    arm.forEach((n) => pivot.attach(n)); // reparent, preserving world transform
    pivot.rotation.y = TONEARM_PARK; // start parked (music off by default)
    armPivot.current = pivot;
    return () => {
      arm.forEach((n) => model.attach(n));
      model.remove(pivot);
      armPivot.current = null;
    };
  }, [model, file]);

  useFrame((state, dt) => {
    if (platter && musicOn) platter.rotation.y += dt * 2.2;
    if (armPivot.current) {
      const target = musicOn ? TONEARM_PLAY : TONEARM_PARK;
      armPivot.current.rotation.y +=
        (target - armPivot.current.rotation.y) * Math.min(1, dt * 2.5);
    }
    // The screen is a 512×340 canvas repainted in JS and re-uploaded to the
    // GPU. At 60 fps that is pure overhead — the caret blinks at 2 Hz and the
    // text types at 22 cps, so 15 fps looks identical and costs a quarter as
    // much main-thread time.
    if (screen) {
      const t = state.clock.elapsedTime;
      if (t >= nextScreenDraw.current) {
        nextScreenDraw.current = t + 1 / 15;
        drawScreen(screen.ctx, t);
        screen.tex.needsUpdate = true;
      }
    }
  });

  return (
    <group position={recenter}>
      <primitive object={model} />

      {/* monitor: glowing screen on the front face */}
      {file === 'monitor' && screen ? (
        <mesh position={[0, screen.cy, screen.z]}>
          <planeGeometry args={[screen.width, screen.height]} />
          <meshBasicMaterial map={screen.tex} toneMapped={false} />
        </mesh>
      ) : null}

      {/* coffee sitting inside the mug (below the rim) */}
      {file === 'cup' ? (
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
          <meshStandardMaterial color={'#3a2213'} roughness={0.15} metalness={0.2} />
        </mesh>
      ) : null}

      {/* lamp: warm light pool on the desk (no visible bulb) */}
      {file === 'lamp' && lampOn && lampHead ? (
        <group position={lampHead}>
          <pointLight position={[0, -0.1, 0]} intensity={26} distance={7} decay={2} color={'#ffca7a'} />
          <pointLight position={[0, -0.9, 0]} intensity={10} distance={5} decay={2} color={'#ffd8a4'} />
        </group>
      ) : null}
    </group>
  );
}

/* ============================================================
   Procedural notebook + pencil (no GLB — matches the reference,
   which builds these two out of geometry).
   ============================================================ */
const NB_COVER = '#161d27';
const NB_PAGE = '#e7e1d0';

function Notebook({ open }) {
  // Local units ≈ the reference (cover 1.78 × 0.131 × 1.36), sits on y=0.
  // The top cover + top page hinge open on the spine (z = -0.68) when clicked.
  const lid = useRef();
  useFrame((_, dt) => {
    if (!lid.current) return;
    const target = open ? -2.5 : 0; // ~-143° = flipped open
    lid.current.rotation.x += (target - lid.current.rotation.x) * Math.min(1, dt * 6);
  });
  return (
    <group position={[0, 0.066, 0]}>
      {/* bottom cover */}
      <RoundedBox args={[1.78, 0.05, 1.36]} radius={0.02} smoothness={3} position={[0, -0.04, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={NB_COVER} roughness={0.6} metalness={0.05} />
      </RoundedBox>
      {/* page block */}
      <RoundedBox args={[1.68, 0.09, 1.28]} radius={0.008} smoothness={2} position={[0, 0.005, 0]} castShadow>
        <meshStandardMaterial color={NB_PAGE} roughness={0.9} />
      </RoundedBox>
      {/* hinged lid (top cover + first page), rotates about the spine */}
      <group ref={lid} position={[0, 0.03, -0.68]}>
        <RoundedBox args={[1.78, 0.05, 1.36]} radius={0.02} smoothness={3} position={[0, 0.02, 0.68]} castShadow receiveShadow>
          <meshStandardMaterial color={NB_COVER} roughness={0.6} metalness={0.05} />
        </RoundedBox>
        {/* printed inner page revealed when open */}
        <mesh position={[0, -0.001, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 1.2]} />
          <meshStandardMaterial color={'#f4efe2'} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* elastic band */}
      <mesh position={[0.55, 0.005, 0]} castShadow>
        <boxGeometry args={[0.05, 0.14, 1.4]} />
        <meshStandardMaterial color={'#20303a'} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ============================================================
   One placed object: drop-in intro, hover cursor + lift, click.
   ============================================================ */
function SceneObject({ obj, onInteract, musicOn }) {
  const hoverRef = useRef();
  const nudge = useRef(0);
  const spinVel = useRef(0); // chair swivel angular velocity
  const spinAng = useRef(0); // chair swivel angle
  const [hovered, setHovered] = useState(false);
  const interactive = obj.interaction && obj.interaction !== 'none';

  /* Hovering sets a pointer cursor on <body>, and onPointerOut is what clears
     it — but clicking the monitor navigates to /work, which unmounts the scene
     before that ever fires, leaving the whole next page stuck showing a hand
     cursor. Clear it on unmount so leaving the scene always resets it. */
  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  useFrame((_, dt) => {
    // hover — a subtle scale bump only (no vertical jump)
    if (hoverRef.current) {
      const h = hoverRef.current;
      const target = hovered && interactive ? 1.03 : 1;
      h.scale.x += (target - h.scale.x) * Math.min(1, dt * 10);
      h.scale.y = h.scale.z = h.scale.x;

      if (obj.id === 'chair') {
        // realistic office-chair swivel: an angular impulse that spins the
        // seat around its post and eases back to rest (spring + friction).
        const k = 6.5; // return spring (re-centres toward the desk)
        const c = 2.3; // friction / damping
        const step = Math.min(dt, 0.05);
        spinVel.current += (-k * spinAng.current - c * spinVel.current) * step;
        spinAng.current += spinVel.current * step;
        h.rotation.y = spinAng.current;
      } else {
        // other objects: a small damped sway on click
        const el = (performance.now() - nudge.current) / 1000;
        if (nudge.current && el < 0.9) {
          h.rotation.z = Math.sin(el * 22) * 0.06 * Math.exp(-el * 4);
        } else if (nudge.current) {
          h.rotation.z = 0;
          nudge.current = 0;
        }
      }
    }
  });

  return (
    <group name={obj.id} position={obj.position} rotation={[0, obj.rotationY, 0]}>
      <group scale={obj.scale}>
        <group
          ref={hoverRef}
          onPointerOver={
            interactive
              ? (e) => {
                  e.stopPropagation();
                  setHovered(true);
                  document.body.style.cursor = 'pointer';
                }
              : undefined
          }
          onPointerOut={
            interactive
              ? (e) => {
                  e.stopPropagation();
                  setHovered(false);
                  document.body.style.cursor = '';
                }
              : undefined
          }
          onClick={
            interactive
              ? (e) => {
                  e.stopPropagation();
                  if (obj.sound) playSample(obj.sound);
                  if (obj.id === 'chair') {
                    // kick the swivel (alternating direction feels natural)
                    spinVel.current += spinVel.current >= 0 ? 3.2 : -3.2;
                  } else if (obj.interaction !== 'music') {
                    nudge.current = performance.now();
                  }
                  onInteract(obj);
                }
              : undefined
          }
        >
          {obj.id === 'notebook' ? (
            <Notebook open={obj.open} />
          ) : (
            <GLBModel
              file={obj.file}
              musicOn={obj.id === 'turntable' && musicOn}
              lampOn={obj.id === 'lamp' && obj.lampOn}
            />
          )}
        </group>
      </group>
    </group>
  );
}

/* ============================================================
   The rig: parallax-root yaws with the mouse; camera pitch is
   handled by the CameraRig in Scene.jsx.
   ============================================================ */
export default function DeskScene({ onInteract, musicOn, lampOn, focusId }) {
  const root = useRef();

  useFrame((state, dt) => {
    if (!root.current) return;
    const targetYaw = state.pointer.x * parallax.yaw;
    root.current.rotation.y += (targetYaw - root.current.rotation.y) * Math.min(1, dt * 2.5);
  });

  return (
    <group name="parallax-root" ref={root}>
      {SCENE_OBJECTS.map((obj) => (
        <SceneObject
          key={obj.id}
          obj={{
            ...obj,
            lampOn: obj.id === 'lamp' ? lampOn : undefined,
            open: obj.id === 'notebook' ? focusId === 'notebook' : undefined,
          }}
          onInteract={onInteract}
          musicOn={musicOn}
        />
      ))}
    </group>
  );
}

// Preload the GLBs (notebook is procedural).
SCENE_OBJECTS.filter((o) => !o.procedural).forEach((o) =>
  useGLTF.preload(`/models/${o.file}.glb`)
);
