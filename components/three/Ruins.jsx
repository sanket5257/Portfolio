"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { state } from "@/lib/store";
import { T, range, smooth, easeInOut, easeIn, lerp, owner } from "@/lib/timeline";
import { stoneMaterial, foliagePatch, crackPatch, NOISE } from "./shaders";
import Vortex from "./Vortex";

const RING_CENTER = new THREE.Vector3(0, 2.05, 0.6);
const RING_R = 2.05;
const EXTRA = 17; // rubble that joins the ring so it reads as a full circle

const rand = (i, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function useStones() {
  const { nodes } = useGLTF("/models/arch.glb");
  return useMemo(() => {
    const src = Object.values(nodes).filter((n) => n.isMesh && n.name.startsWith("Stone"));
    const center = new THREE.Vector3(0, 1.9, 0);
    const list = [];
    const total = src.length + EXTRA;
    src.forEach((n, i) => {
      list.push({
        geo: n.geometry,
        srcMat: n.material,
        pos: n.position.clone(),
        quat: n.quaternion.clone(),
        scale: 1,
        extra: false,
        seed: i,
      });
    });
    for (let k = 0; k < EXTRA; k++) {
      const s = src[k % src.length];
      list.push({
        geo: s.geometry,
        srcMat: s.material,
        // rubble rises out of the ground around the arch
        pos: new THREE.Vector3((rand(k, 1) - 0.5) * 5, -1.2, (rand(k, 2) - 0.5) * 2.5 + 0.4),
        quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(k, 3) * 6, rand(k, 4) * 6, 0)),
        scale: 0.55 + rand(k, 5) * 0.35,
        extra: true,
        seed: 40 + k,
      });
    }
    // ring slot order follows each stone's angle around the arch so neighbours
    // stay neighbours and the motion reads as the arch unfolding into a circle
    const ang = (v) => Math.atan2(v.y - center.y, v.x - center.x);
    const order = list.map((s, i) => [i, s.extra ? (rand(i, 9) - 0.5) * Math.PI * 2 : ang(s.pos)]);
    order.sort((a, b) => a[1] - b[1]);
    order.forEach(([i], slot) => {
      const a = (slot / total) * Math.PI * 2 + Math.PI / 2;
      const s = list[i];
      s.ringAngle = a;
      s.dir = s.pos.clone().sub(center).normalize().add(new THREE.Vector3(0, 0.6, 0.5 + rand(i, 6))).normalize();
      s.spin = new THREE.Vector3(rand(i, 7) - 0.5, rand(i, 8) - 0.5, rand(i, 10) - 0.5).normalize();
      s.delay = rand(i, 11) * 0.35;
    });
    return list;
  }, [nodes]);
}

function Stones() {
  const stones = useStones();
  const refs = useRef([]);
  // one material per stone (same shader program) so each can ignite on its own
  // when the cursor passes over it
  const mats = useMemo(() => stones.map((s, i) => crackPatch(THREE, stones[0].srcMat, { seed: i * 1.7 })), [stones]);
  const heat = useRef(new Float32Array(stones.length));
  const { camera } = useThree();
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const archPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.2), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const glow = useRef();
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      r: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      q2: new THREE.Quaternion(),
      e: new THREE.Euler(),
    }),
    []
  );

  useFrame(({ clock }, dt) => {
    const p = state.progress;
    const t = clock.elapsedTime;
    const ex = range(p, T.explode);
    const rgRaw = range(p, T.ring);
    const rg = easeInOut(rgRaw);
    const dv = range(p, T.dive);
    const crack = smooth(range(p, [T.ring[0] + 0.03, T.ring[1]]));

    // hover: where the cursor meets the arch face, stones loosen and glow,
    // then cool down slowly after the cursor leaves (intro only)
    const intro = 1 - smooth(range(p, [0, T.explode[0] + 0.02]));
    let aimed = false;
    if (intro > 0.01 && state.entered) {
      ndc.set(state.pointer.x, state.pointer.y);
      ray.setFromCamera(ndc, camera);
      aimed = !!ray.ray.intersectPlane(archPlane, hit);
    }
    const H = heat.current;
    const step = Math.min(dt, 0.1);
    stones.forEach((st, i) => {
      let target = 0;
      if (aimed && !st.extra) {
        const d = Math.hypot(st.pos.x - hit.x, st.pos.y - hit.y);
        target = (1 - smooth(THREE.MathUtils.clamp((d - 0.25) / 0.75, 0, 1))) * intro;
      }
      // fast to ignite, slow to cool
      H[i] = target > H[i] ? H[i] + (target - H[i]) * Math.min(1, step * 9) : Math.max(target, H[i] - step * 0.45);
      const u = mats[i].userData.uniforms;
      u.uCrack.value = Math.max(crack, smooth(H[i]));
      u.uTime.value = t;
    });
    // the ignited stones throw blue light onto the moss and ivy around them
    if (glow.current) {
      let hx = 0, hy = 0, w = 0;
      stones.forEach((st, i) => {
        if (H[i] > 0.02) {
          hx += st.pos.x * H[i];
          hy += st.pos.y * H[i];
          w += H[i];
        }
      });
      if (w > 0) glow.current.position.set(hx / w, hy / w, 0.9);
      glow.current.intensity = Math.min(w, 3) * 1.6;
    }
    const ringSpin = t * 0.035 + rg * 0.25 + easeIn(dv) * 1.2;

    stones.forEach((s, i) => {
      const o = refs.current[i];
      if (!o) return;
      // staggered release: lower stones let go a touch later, like gravity fading upward
      const d0 = s.delay * 0.55;
      const e = easeInOut(THREE.MathUtils.clamp((ex - d0) / (1 - d0), 0, 1));
      // 1. weightless: the arch loosens rather than explodes. Small outward
      // drift, a gentle rise, slight tilt, and a slow bob that never stops.
      const out = 0.18 + rand(i, 12) * 0.32;
      tmp.p.copy(s.pos);
      tmp.p.x += (s.pos.x - 0) * out * 0.35 * e;
      tmp.p.y += (0.25 + rand(i, 23) * 0.45) * e;
      tmp.p.z += (rand(i, 24) - 0.35) * 0.55 * e;
      const bob = t * (0.35 + rand(i, 25) * 0.25) + i * 1.7;
      tmp.p.x += Math.sin(bob * 0.7) * 0.035 * e;
      tmp.p.y += Math.sin(bob) * 0.06 * e;
      tmp.p.z += Math.cos(bob * 0.8) * 0.04 * e;
      if (s.extra) {
        // rubble rises from the ground and joins the drift
        tmp.p.copy(s.pos);
        tmp.p.y = lerp(s.pos.y, 0.4 + rand(i, 13) * 2.8, e) + Math.sin(bob) * 0.06 * e;
      }
      const tilt = e * (0.18 + rand(i, 14) * 0.35) + Math.sin(bob * 0.6) * 0.05 * e;
      tmp.q.setFromAxisAngle(s.spin, tilt).premultiply(s.quat);
      // 2. ring: snap to slot, long axis radial like voussoirs in a rose window
      const a = s.ringAngle + ringSpin;
      const rr = RING_R + (rand(i, 15) - 0.5) * 0.22;
      const ringPos = tmp.r.set(
        RING_CENTER.x + Math.cos(a) * rr,
        RING_CENTER.y + Math.sin(a) * rr,
        RING_CENTER.z + (rand(i, 16) - 0.5) * 0.35
      );
      tmp.q2.setFromEuler(tmp.e.set(rand(i, 17) * 0.3, rand(i, 18) * 0.3, a + Math.PI / 2));
      // hovered stones float a little toward the camera and wobble loose
      const h = smooth(H[i]);
      if (h > 0.001) {
        tmp.p.z += h * (0.22 + rand(i, 19) * 0.18);
        tmp.p.x += h * (s.pos.x - 0) * 0.04;
        tmp.p.y += h * (0.04 + Math.sin(t * 2.2 + i) * 0.025);
        tmp.e.set(
          h * (rand(i, 20) - 0.5) * 0.35 + Math.sin(t * 1.7 + i) * 0.03 * h,
          h * (rand(i, 21) - 0.5) * 0.45,
          h * (rand(i, 22) - 0.5) * 0.25
        );
        tmp.q.multiply(tmp.q2.setFromEuler(tmp.e));
      }
      const rd = rand(i, 26) * 0.45;
      const ri = easeInOut(THREE.MathUtils.clamp((rgRaw - rd) / (1 - rd), 0, 1));
      ringPos.y += Math.sin(t * 0.5 + i * 2.1) * 0.03; // the ring breathes too
      ringPos.z += Math.sin(Math.PI * ri) * 0.35; // swing forward on the way, not a straight slide
      o.position.lerpVectors(tmp.p, ringPos, ri);
      tmp.q2.setFromEuler(tmp.e.set(rand(i, 17) * 0.25, rand(i, 18) * 0.25, a + Math.PI / 2));
      o.quaternion.slerpQuaternions(tmp.q, tmp.q2, ri);
      const sc = s.extra ? s.scale * smooth(THREE.MathUtils.clamp(e * 1.4, 0, 1)) : s.scale;
      o.scale.setScalar(sc * (1 - ri * 0.1));
    });
  });

  return (
    <>
      <pointLight ref={glow} color="#3ea8ff" intensity={0} distance={3.2} decay={1.5} />
      {stones.map((s, i) => (
    <mesh
      key={i}
      ref={(r) => (refs.current[i] = r)}
      geometry={s.geo}
      material={mats[i]}
      position={s.pos}
      quaternion={s.quat}
    />
      ))}
    </>
  );
}

// Ground: only the floor plane survives from the blockout; the walls, rocks
// and stairs are textured Higgsfield scans placed around it.
function Ground() {
  const { nodes } = useGLTF("/models/ruins.glb");
  const mat = useMemo(() => stoneMaterial(THREE, { color: "#1d1b17", moss: 0.25, seed: 9 }), []);
  const ground = Object.values(nodes).find((n) => n.isMesh && n.name.startsWith("Ground"));
  return ground ? <mesh geometry={ground.geometry} material={mat} position={ground.position} /> : null;
}

// Places copies of a model with its base sitting on y (models arrive centred).
// kind "foliage" adds wind sway; "rock" keeps the scan texture but darkens it.
function Props({ url, items, kind = "rock", sway = 0.05, tint }) {
  const { scene } = useGLTF(url);
  const mats = useRef([]);
  const proto = useMemo(() => {
    const r = scene.clone(true);
    const box = new THREE.Box3().setFromObject(r);
    r.position.y -= box.min.y;
    r.position.x -= (box.min.x + box.max.x) / 2;
    r.position.z -= (box.min.z + box.max.z) / 2;
    const wrap = new THREE.Group();
    wrap.add(r);
    r.traverse((o) => {
      if (!o.isMesh) return;
      let m = o.material.clone();
      m.metalness = 0;
      m.metalnessMap = null;
      m.roughnessMap = null; // AI PBR maps read as wet plastic under a hard key light
      m.envMapIntensity = 0.15;
      if ("clearcoat" in m) m.clearcoat = 0;
      if ("specularIntensity" in m) m.specularIntensity = 0.3;
      if (kind === "foliage") {
        m.roughness = 0.8;
        m = foliagePatch(THREE, m, { sway, tint });
        mats.current.push(m);
      } else {
        m.roughness = 1;
        m.color = new THREE.Color(tint || "#8a8a8a");
      }
      o.material = m;
    });
    return wrap;
  }, [scene, kind, sway, tint]);
  useFrame(({ clock }) => mats.current.forEach((m) => (m.userData.uniforms.uTime.value = clock.elapsedTime)));
  return items.map(([x, y, z, sc, ry, sx], i) => (
    <primitive
      key={i}
      object={i === 0 ? proto : proto.clone(true)}
      position={[x, y, z]}
      scale={sx ? [sc * sx, sc, sc] : sc}
      rotation={[0, ry, 0]}
    />
  ));
}

function Butterfly() {
  const { nodes } = useGLTF("/models/butterfly.glb");
  const g = useRef();
  const wings = useRef({});
  const parts = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({ color: "#3aa0ff", side: THREE.DoubleSide, toneMapped: false });
    return Object.values(nodes)
      .filter((n) => n.isMesh)
      .map((n) => ({ name: n.name, geo: n.geometry, mat }));
  }, [nodes]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flap = Math.sin(t * 16) * 0.9 + 0.2;
    Object.entries(wings.current).forEach(([n, w]) => {
      if (w) w.rotation.z = n.includes("_L") ? -flap : flap;
    });
    // wandering figure-eight around the arch base
    g.current.position.set(Math.sin(t * 0.31) * 1.9 + 0.4, 0.55 + Math.sin(t * 0.7) * 0.25 + Math.sin(t * 2.1) * 0.05, 1.3 + Math.sin(t * 0.62) * 0.9);
    g.current.rotation.y = Math.cos(t * 0.31) * 0.9 + Math.PI / 2;
    const ex = range(state.progress, T.explode);
    g.current.scale.setScalar(0.85 * (1 - ex));
  });
  return (
    <group ref={g}>
      {parts.map((p) => (
        <mesh
          key={p.name}
          ref={(r) => (wings.current[p.name] = p.name.startsWith("Wing") ? r : null)}
          geometry={p.geo}
          material={p.mat}
        />
      ))}
      <pointLight color="#3aa0ff" intensity={0.6} distance={1.5} />
    </group>
  );
}

// Volumetric-looking light shafts: additive planes with soft edges and drifting noise.
function GodRays() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
        fragmentShader: `
          ${NOISE}
          varying vec2 vUv; uniform float uTime; uniform float uOpacity;
          void main(){
            float across = smoothstep(0., .5, vUv.x) * smoothstep(1., .5, vUv.x);
            float along = smoothstep(0., .25, vUv.y) * smoothstep(1., .55, vUv.y);
            float streak = .55 + .45 * vnoise(vec3(vUv.x * 18., vUv.y * .6 - uTime * .05, uTime * .1));
            float a = across * along * streak * .23 * uOpacity;
            gl_FragColor = vec4(vec3(1., .78, .45) * a, a);
          }`,
      }),
    []
  );
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uOpacity.value = 1 - range(state.progress, T.explode) * 0.7;
  });
  return (
    <group position={[1.4, 4.6, -0.8]} rotation={[0, 0, -0.62]}>
      {[
        [0, 0, 0, 1.2],
        [0.55, 0.2, 0.4, 0.7],
        [-0.45, -0.1, -0.5, 0.9],
        [0.95, 0.3, -0.2, 0.5],
      ].map(([x, y, z, w], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, (i - 1.5) * 0.12, 0]} material={mat}>
          <planeGeometry args={[w, 9.5]} />
        </mesh>
      ))}
    </group>
  );
}

// Floating dust in the light + a few blinking fireflies.
function Motes({ count = 520 }) {
  const ref = useRef();
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand(i, 1) - 0.5) * 9;
      pos[i * 3 + 1] = rand(i, 2) * 5 - 0.6;
      pos[i * 3 + 2] = (rand(i, 3) - 0.5) * 6 + 0.5;
      seed[i] = rand(i, 4);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: `
        attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA; varying float vFly;
        void main(){
          vec3 p = position;
          p.x += sin(uTime * .2 + aSeed * 40.) * .35;
          p.y += mod(uTime * (.03 + aSeed * .05) + aSeed * 5., 5.) - 2.5 + 2.5;
          p.z += cos(uTime * .17 + aSeed * 22.) * .3;
          vFly = step(.975, aSeed);
          vA = vFly > .5 ? pow(.5 + .5 * sin(uTime * (1. + aSeed * 2.) + aSeed * 60.), 3.) * .8 : (.08 + .14 * aSeed);
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (vFly > .5 ? 5. : 2.2) * uPx / -mv.z;
        }`,
      fragmentShader: `
        varying float vA; varying float vFly;
        void main(){
          float d = length(gl_PointCoord - .5);
          float a = smoothstep(.5, 0., d) * vA;
          vec3 c = vFly > .5 ? vec3(.45, 1., .7) : vec3(1., .86, .6);
          gl_FragColor = vec4(c * a, a);
        }`,
    });
    return { geo: g, mat: m };
  }, [count]);
  useFrame(({ clock, gl }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uPx.value = gl.getPixelRatio() * 4;
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

// [x, y, z, scale, rotY, xStretch?]
const CLIFFS = [
  [-4.6, -0.75, -0.6, 6.4, 0.6],
  [4.8, -0.75, -0.8, 6.8, 2.4],
  [-1.2, -0.75, -3.6, 7.5, 1.4, 1.6],
  [2.6, -0.75, -3.4, 7.2, 3.9, 1.4],
  [-6.2, -0.75, 2.4, 5.5, 4.4],
  [6.4, -0.75, 2.2, 5.5, 0.9],
];
const BOULDERS = [
  [-2.5, -0.75, 1.0, 1.1, 0.4],
  [2.7, -0.75, 1.3, 0.9, 2.2],
  [-3.4, -0.75, -1.2, 1.6, 1.0],
  [3.5, -0.75, -1.0, 1.4, 3.1],
  [1.6, -0.75, 3.2, 0.5, 5.0],
];
const STAIRS = [[0.0, -0.75, 1.15, 2.6, Math.PI, 1.25]];
const FERNS = [
  [-1.55, -0.1, 1.2, 1.15, 0.3],
  [-0.9, -0.6, 2.2, 0.9, 1.8],
  [1.45, -0.1, 1.15, 1.05, 2.4],
  [2.3, -0.7, 0.3, 1.25, 0.9],
  [-2.4, -0.7, 0.2, 1.3, 4.1],
  [0.8, -0.7, 2.7, 0.75, 3.3],
];
const MONSTERAS = [
  [-2.2, -0.75, 1.9, 1.5, 0.4],
  [2.6, -0.75, 1.9, 1.7, 2.6],
  [-3.4, -0.75, 0.2, 2.1, 1.3],
  [3.5, -0.75, 0.1, 1.9, 4.0],
];
const ROOTS = [
  [-3.9, -0.75, 1.1, 2.4, 0.8],
  [4.0, -0.75, 0.8, 2.6, 3.6],
];
const LILIES = [
  [-1.4, -0.72, 3.6, 1.5, 0.3],
  [1.9, -0.72, 4.1, 1.2, 2.1],
];

export default function Ruins() {
  const group = useRef();
  const { camera, scene } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const smoothPtr = useRef({ x: 0, y: 0 });
  const fog = useMemo(() => new THREE.FogExp2("#010101", 0.09), []);

  useFrame(() => {
    const p = state.progress;
    const mine = owner(p) === "ruins";
    group.current.visible = mine;
    if (!mine) return;
    scene.fog = fog;
    scene.background = null;
    const sp = smoothPtr.current;
    sp.x += (state.pointer.x - sp.x) * 0.04;
    sp.y += (state.pointer.y - sp.y) * 0.04;

    const ex = smooth(range(p, T.explode));
    const rg = easeInOut(range(p, T.ring));
    const dv = easeIn(range(p, T.dive));
    // intro framing -> centred on the ring -> plunge through the portal
    const z = lerp(lerp(7.6, 8.4, ex), 7.2, rg);
    const y = lerp(1.5, RING_CENTER.y, Math.max(rg, ex * 0.4));
    camera.position.set(sp.x * 0.35 * (1 - dv), y + sp.y * 0.18 * (1 - dv), lerp(z, RING_CENTER.z + 1.1, dv)); // push in until the portal fills the frame
    look.set(sp.x * 0.1, lerp(1.45, RING_CENTER.y, Math.max(rg, ex * 0.4)), RING_CENTER.z - 4);
    camera.lookAt(look);
    camera.rotation.z += dv * dv * 0.25; // a slight roll with the swirl
    camera.fov = 40 + dv * 8;
    camera.updateProjectionMatrix();
    fog.density = lerp(0.09, 0.04, rg);
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.07} color="#8fa0a8" />
      <hemisphereLight args={["#3c4a3e", "#030303", 0.3]} />
      <directionalLight position={[4, 9, 2]} intensity={1.5} color="#ffcf94" />
      <spotLight position={[2.5, 7, 1]} angle={0.42} penumbra={0.9} intensity={48} distance={16} color="#ffcf8a" target-position={[0, 1.5, 0]} />
      <pointLight position={[-2.5, 1.2, 2.5]} intensity={0.35} distance={6} color="#6f8f9a" />
      <Ground />
      <Props url="/models/cliff.glb" items={CLIFFS} tint="#6e6a62" />
      <Props url="/models/boulder.glb" items={BOULDERS} tint="#77736a" />
      <Props url="/models/stairs.glb" items={STAIRS} tint="#807b70" />
      <Stones />
      <Props url="/models/fern.glb" items={FERNS} kind="foliage" sway={0.08} tint="#9fb39a" />
      <Props url="/models/monstera.glb" items={MONSTERAS} kind="foliage" sway={0.04} tint="#8a9a84" />
      <Props url="/models/roots.glb" items={ROOTS} tint="#8a8070" />
      <Props url="/models/waterlily.glb" items={LILIES} kind="foliage" sway={0.01} tint="#a3b0a3" />
      <Butterfly />
      <GodRays />
      <Motes />
      <Vortex center={RING_CENTER} radius={RING_R * 0.93} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 3.4]}>
        <planeGeometry args={[14, 5]} />
        <MeshReflectorMaterial
          resolution={512}
          mixBlur={6}
          blur={[400, 120]}
          mixStrength={1.6}
          roughness={0.85}
          depthScale={0.6}
          minDepthThreshold={0.4}
          color="#0a0c0a"
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}
